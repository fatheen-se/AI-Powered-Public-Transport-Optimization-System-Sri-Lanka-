import json
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from identity.models import Role
from fleet.models import Vehicle, Driver
from routing.models import Stop, Route, RouteStop

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with extensive test data for Sri Lankan transit system'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database with Sri Lankan transit data...")

        # 1. Create Roles
        driver_role, _ = Role.objects.get_or_create(name="Driver")
        passenger_role, _ = Role.objects.get_or_create(name="Passenger")

        # 2. Create Users
        if not User.objects.filter(email="admin@srilankatransit.com").exists():
            User.objects.create_superuser("admin@srilankatransit.com", "admin123")
        
        user1, _ = User.objects.get_or_create(email="driver1@srilankatransit.com", defaults={"role": driver_role})
        if _: user1.set_password("driver123"); user1.save()

        user2, _ = User.objects.get_or_create(email="driver2@srilankatransit.com", defaults={"role": driver_role})
        if _: user2.set_password("driver123"); user2.save()

        passenger, _ = User.objects.get_or_create(email="passenger1@srilankatransit.com", defaults={"role": passenger_role})
        if _: passenger.set_password("passenger123"); passenger.save()

        # 3. Create Drivers and Vehicles
        Driver.objects.get_or_create(user=user1, defaults={"license_number": "DL-00123"})
        Driver.objects.get_or_create(user=user2, defaults={"license_number": "DL-00456"})
        
        Vehicle.objects.get_or_create(registration_number="ND-1234", defaults={"capacity": 54})
        Vehicle.objects.get_or_create(registration_number="ND-5678", defaults={"capacity": 42})
        Vehicle.objects.get_or_create(registration_number="WP-9999", defaults={"capacity": 60})

        # 4. Create Stops
        stops_data = [
            {"name": "Pettah", "lat": 6.9344, "lng": 79.8511, "zone": "Colombo"},
            {"name": "Town Hall", "lat": 6.9157, "lng": 79.8636, "zone": "Colombo"},
            {"name": "Borella", "lat": 6.9147, "lng": 79.8778, "zone": "Colombo"},
            {"name": "Nugegoda", "lat": 6.8711, "lng": 79.8884, "zone": "Colombo"},
            {"name": "Maharagama", "lat": 6.8480, "lng": 79.9265, "zone": "Colombo"},
            {"name": "Homagama", "lat": 6.8412, "lng": 80.0034, "zone": "Colombo"},
            {"name": "Piliyandala", "lat": 6.7993, "lng": 79.9231, "zone": "Colombo"},
            {"name": "Dehiwala", "lat": 6.8511, "lng": 79.8682, "zone": "Colombo"},
            {"name": "Moratuwa", "lat": 6.7730, "lng": 79.8816, "zone": "Colombo"},
        ]
        
        stop_objs = {}
        for s in stops_data:
            obj, _ = Stop.objects.get_or_create(name=s["name"], defaults={
                "latitude": s["lat"],
                "longitude": s["lng"],
                "zone": s["zone"]
            })
            stop_objs[s["name"]] = obj

        # 5. Create Routes & RouteStops & Polylines
        routes_data = [
            {
                "number": "138",
                "start": "Pettah",
                "end": "Homagama",
                "path": ["Pettah", "Town Hall", "Borella", "Nugegoda", "Maharagama", "Homagama"]
            },
            {
                "number": "120",
                "start": "Pettah",
                "end": "Piliyandala",
                "path": ["Pettah", "Town Hall", "Nugegoda", "Piliyandala"]
            },
            {
                "number": "154",
                "start": "Pettah",
                "end": "Moratuwa",
                "path": ["Pettah", "Dehiwala", "Moratuwa"]
            }
        ]

        for rd in routes_data:
            start_stop = stop_objs[rd["start"]]
            end_stop = stop_objs[rd["end"]]
            
            # Create a simple polyline linking the stops directly for the UI
            polyline = [{"lat": stop_objs[name].latitude, "lng": stop_objs[name].longitude} for name in rd["path"]]
            
            route, _ = Route.objects.get_or_create(route_number=rd["number"], defaults={
                "start_location": start_stop,
                "end_location": end_stop,
                "polyline": polyline
            })

            # Recreate RouteStops
            RouteStop.objects.filter(route=route).delete()
            for idx, stop_name in enumerate(rd["path"]):
                RouteStop.objects.create(
                    route=route,
                    stop=stop_objs[stop_name],
                    order=idx + 1,
                    distance_from_start=idx * 2.5 # dummy distance
                )

        self.stdout.write(self.style.SUCCESS("Extensive Database Seeding Completed Successfully!"))
