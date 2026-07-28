from django.core.management.base import BaseCommand
from routing.models import Stop, Route, RouteStop

class Command(BaseCommand):
    help = 'Seeds the database with mock Route data (Colombo 138)'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Stops...")
        
        stops_data = [
            ("Maharagama", 6.8480, 79.9265, "Zone A"),
            ("Nugegoda", 6.8649, 79.8997, "Zone A"),
            ("Kirulapone", 6.8781, 79.8735, "Zone B"),
            ("Thummulla", 6.8950, 79.8600, "Zone B"),
            ("Town Hall", 6.9150, 79.8600, "Zone C"),
            ("Pettah", 6.9380, 79.8540, "Zone C"),
        ]

        created_stops = []
        for name, lat, lng, zone in stops_data:
            stop, created = Stop.objects.get_or_create(
                name=name,
                defaults={'latitude': lat, 'longitude': lng, 'zone': zone}
            )
            created_stops.append(stop)

        self.stdout.write(f"Successfully ensured {len(created_stops)} Stops exist.")

        self.stdout.write("Seeding Route 138...")
        polyline = [{"lat": s.latitude, "lng": s.longitude} for s in created_stops]
        
        route, route_created = Route.objects.get_or_create(
            route_number="138",
            defaults={
                'start_location': created_stops[0],
                'end_location': created_stops[-1],
                'polyline': polyline
            }
        )

        if route_created:
            for i, stop in enumerate(created_stops):
                RouteStop.objects.create(
                    route=route,
                    stop=stop,
                    order=i + 1,
                    distance_from_start=i * 2.5 # Mock distance
                )
            self.stdout.write(self.style.SUCCESS("Successfully seeded Route 138 and RouteStops."))
        else:
            self.stdout.write("Route 138 already exists. Skipping.")
