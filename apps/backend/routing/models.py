import uuid
from django.db import models
from django.utils import timezone

class Stop(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    latitude = models.FloatField()
    longitude = models.FloatField()
    zone = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Route(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route_number = models.CharField(max_length=50, unique=True)
    start_location = models.ForeignKey(Stop, on_delete=models.RESTRICT, related_name='routes_starting_here')
    end_location = models.ForeignKey(Stop, on_delete=models.RESTRICT, related_name='routes_ending_here')
    polyline = models.JSONField(help_text="Array of {lat, lng} coordinates")
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Route {self.route_number}"

class RouteStop(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='route_stops')
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='route_connections')
    order = models.PositiveIntegerField()
    distance_from_start = models.FloatField(help_text="Distance in kilometers from the start of the route", default=0.0)

    class Meta:
        ordering = ['route', 'order']
        unique_together = ('route', 'stop')

    def __str__(self):
        return f"{self.route.route_number} - Stop {self.order}: {self.stop.name}"
