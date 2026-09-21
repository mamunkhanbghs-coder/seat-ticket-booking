from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class SeatCategory(models.TextChoices):
    VIP = 'VIP', 'VIP'
    PREMIUM = 'PREMIUM', 'Premium'
    REGULAR = 'REGULAR', 'Regular'
    ECONOMY = 'ECONOMY', 'Economy'

class SeatStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Available'
    HELD = 'HELD', 'Temporarily Held'
    BOOKED = 'BOOKED', 'Booked'

class Seat(models.Model):
    """
    Physical seat definition within a venue or bus layout.
    """
    venue_id = models.IntegerField(null=True, blank=True)
    bus_id = models.IntegerField(null=True, blank=True)
    section = models.CharField(max_length=50, default='Main')
    row = models.CharField(max_length=10)
    seat_number = models.CharField(max_length=10)
    category = models.CharField(max_length=20, choices=SeatCategory.choices, default=SeatCategory.REGULAR)

    class Meta:
        indexes = [
            models.Index(fields=['venue_id', 'section', 'row', 'seat_number']),
            models.Index(fields=['bus_id', 'row', 'seat_number']),
        ]

    def __str__(self):
        return f"{self.row}{self.seat_number} ({self.category})"

class EventSeat(models.Model):
    """
    Event-specific or Bus Departure-specific seat inventory item.
    This is the core row locked during concurrent booking attempts.
    """
    event_id = models.IntegerField(null=True, blank=True)
    bus_trip_id = models.IntegerField(null=True, blank=True)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='event_seats')
    
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=SeatStatus.choices, default=SeatStatus.AVAILABLE)
    
    # Version column for optional optimistic locking verification
    version = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('event_id', 'seat'), ('bus_trip_id', 'seat'))
        indexes = [
            models.Index(fields=['event_id', 'status']),
            models.Index(fields=['bus_trip_id', 'status']),
        ]

    def __str__(self):
        return f"EventSeat #{self.id}: Seat {self.seat.seat_number} - {self.status}"

class SeatHold(models.Model):
    """
    Tracks a 5-minute temporary seat hold reservation.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seat_holds')
    event_seat = models.OneToOneField(EventSeat, on_delete=models.CASCADE, related_name='current_hold')
    locked_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['expires_at', 'is_active']),
            models.Index(fields=['user', 'is_active']),
        ]

    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)
