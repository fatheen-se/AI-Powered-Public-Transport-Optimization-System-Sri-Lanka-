from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from routing.models import Route
import time
import json

class Command(BaseCommand):
    help = 'Simulates a bus moving along Route 138 and pushes to Redis'

    def handle(self, *args, **options):
        self.stdout.write("Starting Fleet Simulator...")
        channel_layer = get_channel_layer()
        
        try:
            route = Route.objects.get(route_number="138")
            polyline = route.polyline
        except Route.DoesNotExist:
            self.stderr.write("Route 138 not found. Run seed_mock_routes first.")
            return

        if not polyline:
            self.stderr.write("Route 138 has no polyline.")
            return

        self.stdout.write(f"Loaded Route 138 with {len(polyline)} points.")
        
        vehicle_id = "mock-bus-138"
        direction = 1
        current_idx = 0

        while True:
            point = polyline[current_idx]
            
            message = {
                "vehicle_id": vehicle_id,
                "route_number": "138",
                "lat": point['lat'],
                "lng": point['lng'],
                "timestamp": time.time()
            }

            async_to_sync(channel_layer.group_send)(
                'fleet_tracking',
                {
                    'type': 'fleet_update',
                    'message': message
                }
            )

            self.stdout.write(f"Broadcasted: {message['lat']}, {message['lng']}")
            
            current_idx += direction
            if current_idx >= len(polyline) - 1:
                direction = -1
            elif current_idx <= 0:
                direction = 1
                
            time.sleep(2)
