import uuid
from django.db import models
from django.utils import timezone
from fleet.models import Vehicle, Driver
from routing.models import Route, Stop

class Trip(models.Model):
    class StatusChoices(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(Route, on_delete=models.RESTRICT, related_name='trips')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.RESTRICT, related_name='trips')
    driver = models.ForeignKey(Driver, on_delete=models.RESTRICT, related_name='trips')
    
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.SCHEDULED)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'start_time']),
        ]

    def __str__(self):
        return f"Trip {self.id} - {self.route.route_number}"

class Tracking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='tracking_logs')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        # High volume table - indexes are critical
        indexes = [
            models.Index(fields=['trip', '-timestamp']),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"Track {self.trip.id} @ {self.timestamp}"

class PassengerCount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='passenger_counts')
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='passenger_data')
    boarding = models.PositiveIntegerField(default=0)
    alighting = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Counts at {self.stop.name} (Trip: {self.trip.id})"
