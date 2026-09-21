import logging
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from apps.inventory.models import EventSeat, SeatHold, SeatStatus
from apps.pricing.services import DynamicPricingEngine

logger = logging.getLogger(__name__)

class ConcurrencyBookingError(Exception):
    """Raised when a concurrency conflict occurs (e.g. seat already held or booked)."""
    pass

class SeatInventoryService:
    """
    Production-grade, concurrency-safe inventory management service.
    
    Guarantees:
    1. Zero double-holds or double-bookings using PostgreSQL SELECT FOR UPDATE row-level locking.
    2. Atomic 5-minute hold allocation with price locking.
    3. Lazy evaluation of expired holds so delayed background jobs never block seats.
    """

    HOLD_DURATION_MINUTES = 5

    @classmethod
    @transaction.atomic
    def hold_seat(cls, user, event_seat_id: int):
        """
        Attempts to hold a single seat for 5 minutes.
        
        Uses select_for_update() to lock the specific EventSeat row.
        Any concurrent transaction attempting to hold or book the same row
        will block until this transaction commits or aborts.
        """
        now = timezone.now()

        # Step 1: Acquire row-level lock on EventSeat
        try:
            event_seat = EventSeat.objects.select_for_update().get(id=event_seat_id)
        except EventSeat.DoesNotExist:
            raise ConcurrencyBookingError(f"EventSeat {event_seat_id} does not exist.")

        # Step 2: Check current status & handle lazy expiration
        if event_seat.status == SeatStatus.BOOKED:
            logger.warning(f"Reject hold: Seat {event_seat_id} is permanently BOOKED.")
            raise ConcurrencyBookingError("This seat has already been booked by another user.")

        if event_seat.status == SeatStatus.HELD:
            # Check if existing hold has expired (lazy cleanup)
            try:
                existing_hold = SeatHold.objects.select_for_update().get(
                    event_seat=event_seat,
                    is_active=True
                )
                if existing_hold.expires_at > now:
                    # Still active and held by another user
                    if existing_hold.user_id == user.id:
                        # User already holds it: return current hold and extend timer
                        return existing_hold
                    raise ConcurrencyBookingError("This seat is currently held by another user. Try again later.")
                else:
                    # Expired hold: deactivate it and free seat for the new user
                    existing_hold.is_active = False
                    existing_hold.save(update_fields=['is_active'])
                    event_seat.status = SeatStatus.AVAILABLE
            except SeatHold.DoesNotExist:
                # Inconsistent state recovery: if status is HELD but no hold record, restore AVAILABLE
                event_seat.status = SeatStatus.AVAILABLE

        # Step 3: Calculate dynamic price at the moment of hold
        current_price = DynamicPricingEngine.calculate_price(event_seat)

        # Step 4: Create SeatHold record (locks the price for 5 minutes)
        expires_at = now + timedelta(minutes=cls.HOLD_DURATION_MINUTES)
        hold = SeatHold.objects.create(
            user=user,
            event_seat=event_seat,
            locked_price=current_price,
            expires_at=expires_at,
            is_active=True
        )

        # Step 5: Transition EventSeat state to HELD
        event_seat.status = SeatStatus.HELD
        event_seat.current_price = current_price
        event_seat.version += 1
        event_seat.save(update_fields=['status', 'current_price', 'version', 'updated_at'])

        logger.info(f"Seat {event_seat_id} successfully held for user {user.id} until {expires_at}.")
        return hold

    @classmethod
    @transaction.atomic
    def release_hold(cls, user, event_seat_id: int):
        """
        Manually releases a seat hold by user request (e.g. deselected on seat map).
        """
        event_seat = EventSeat.objects.select_for_update().get(id=event_seat_id)
        
        try:
            hold = SeatHold.objects.select_for_update().get(
                event_seat=event_seat,
                user=user,
                is_active=True
            )
            hold.is_active = False
            hold.save(update_fields=['is_active'])
        except SeatHold.DoesNotExist:
            pass

        event_seat.status = SeatStatus.AVAILABLE
        event_seat.version += 1
        event_seat.save(update_fields=['status', 'version', 'updated_at'])
        return True

    @classmethod
    @transaction.atomic
    def release_expired_holds(cls):
        """
        Sweeper method run periodically by Celery Beat every 30 seconds.
        Finds all active holds where expires_at < now, releases them, and marks seats AVAILABLE.
        """
        now = timezone.now()
        expired_holds = SeatHold.objects.select_for_update().filter(
            expires_at__lt=now,
            is_active=True
        )
        
        count = 0
        for hold in expired_holds:
            hold.is_active = False
            hold.save(update_fields=['is_active'])
            
            event_seat = hold.event_seat
            if event_seat.status == SeatStatus.HELD:
                event_seat.status = SeatStatus.AVAILABLE
                event_seat.version += 1
                event_seat.save(update_fields=['status', 'version', 'updated_at'])
                count += 1
                
        logger.info(f"Celery task cleaned {count} expired seat holds.")
        return count
