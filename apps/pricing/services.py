from decimal import Decimal
import math

class DynamicPricingEngine:
    """
    Configurable dynamic pricing engine that calculates current ticket prices
    based on real-time occupancy percentages, category tiers, and admin pricing rules.
    """

    DEFAULT_TIERS = [
        {'min_pct': Decimal('0'),  'max_pct': Decimal('50'),  'markup_pct': Decimal('0')},
        {'min_pct': Decimal('51'), 'max_pct': Decimal('70'),  'markup_pct': Decimal('10')},
        {'min_pct': Decimal('71'), 'max_pct': Decimal('85'),  'markup_pct': Decimal('20')},
        {'min_pct': Decimal('86'), 'max_pct': Decimal('95'),  'markup_pct': Decimal('35')},
        {'min_pct': Decimal('96'), 'max_pct': Decimal('100'), 'markup_pct': Decimal('50')},
    ]

    CATEGORY_MULTIPLIERS = {
        'VIP': Decimal('2.0'),
        'PREMIUM': Decimal('1.5'),
        'REGULAR': Decimal('1.0'),
        'ECONOMY': Decimal('0.85'),
    }

    @classmethod
    def calculate_price(cls, event_seat, total_seats_count: int = None, sold_seats_count: int = None) -> Decimal:
        """
        Calculates dynamic price based on inventory occupancy.
        """
        base_price = Decimal(str(event_seat.base_price))
        category = event_seat.seat.category
        category_multiplier = cls.CATEGORY_MULTIPLIERS.get(category, Decimal('1.0'))

        # If counts not passed, query from database
        if total_seats_count is None or sold_seats_count is None:
            from apps.inventory.models import EventSeat, SeatStatus
            if event_seat.event_id:
                total_seats = EventSeat.objects.filter(event_id=event_seat.event_id).count()
                sold_seats = EventSeat.objects.filter(
                    event_id=event_seat.event_id,
                    status__in=[SeatStatus.BOOKED, SeatStatus.HELD]
                ).count()
            elif event_seat.bus_trip_id:
                total_seats = EventSeat.objects.filter(bus_trip_id=event_seat.bus_trip_id).count()
                sold_seats = EventSeat.objects.filter(
                    bus_trip_id=event_seat.bus_trip_id,
                    status__in=[SeatStatus.BOOKED, SeatStatus.HELD]
                ).count()
            else:
                total_seats = 100
                sold_seats = 20
        else:
            total_seats = total_seats_count
            sold_seats = sold_seats_count

        occupancy_pct = (Decimal(sold_seats) / Decimal(total_seats) * Decimal('100')) if total_seats > 0 else Decimal('0')
        occupancy_pct = min(occupancy_pct, Decimal('100'))

        # Match tier
        markup_pct = Decimal('0')
        for tier in cls.DEFAULT_TIERS:
            if tier['min_pct'] <= occupancy_pct <= tier['max_pct']:
                markup_pct = tier['markup_pct']
                break

        # Base * Category * (1 + markup)
        adjusted_base = base_price * category_multiplier
        final_price = adjusted_base * (Decimal('1.0') + (markup_pct / Decimal('100')))
        return final_price.quantize(Decimal('0.01'))
