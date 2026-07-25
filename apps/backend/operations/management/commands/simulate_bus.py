import time
import json
import asyncio
import websockets
from django.core.management.base import BaseCommand
from fleet.models import Vehicle

class Command(BaseCommand):
    help = 'Simulates a bus driving along a route and broadcasting GPS via WebSockets'

    def handle(self, *args, **kwargs):
        bus = Vehicle.objects.first()
        if not bus:
            self.stdout.write(self.style.ERROR("No vehicles found. Run seed_data first."))
            return

        self.stdout.write(self.style.SUCCESS(f"Starting simulation for Vehicle {bus.registration_number}"))
        
        # Route 138 path (approximate coordinates down Galle Road / High Level)
        path = [
            (6.9332, 79.8504), # Pettah
            (6.9250, 79.8550),
            (6.9157, 79.8631), # Town Hall
            (6.9150, 79.8700),
            (6.9149, 79.8783), # Borella
            (6.8900, 79.8850),
            (6.8741, 79.8967), # Nugegoda
            (6.8600, 79.9100),
            (6.8480, 79.9265)  # Maharagama
        ]

        asyncio.run(self.simulate_movement(str(bus.id), path))

    async def simulate_movement(self, bus_id, path):
        uri = "ws://localhost:8001/ws/fleet/"
        
        try:
            async with websockets.connect(uri) as websocket:
                self.stdout.write(self.style.SUCCESS("Connected to WebSocket Server!"))
                
                # Infinite loop: drive back and forth
                forward = True
                while True:
                    traverse_path = path if forward else list(reversed(path))
                    
                    for lat, lon in traverse_path:
                        payload = {
                            "type": "location_update",
                            "bus_id": bus_id,
                            "route_id": "route_138",
                            "latitude": lat,
                            "longitude": lon,
                            "speed": 40.5  # km/h
                        }
                        
                        await websocket.send(json.dumps(payload))
                        self.stdout.write(f"Broadcasted: Lat {lat}, Lon {lon}")
                        
                        # Wait 3 seconds before next ping
                        await asyncio.sleep(3)
                        
                    # Reverse direction when reaching the end
                    forward = not forward
                    self.stdout.write(self.style.WARNING("Bus reached the terminal. Reversing direction..."))
                    await asyncio.sleep(5)
                    
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"WebSocket Connection Failed: {e}"))
            self.stdout.write(self.style.WARNING("Make sure the Daphne WS server is running on port 8001"))
