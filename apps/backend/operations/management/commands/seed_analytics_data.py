from django.core.management.base import BaseCommand
from operations.models import Trip, PassengerCount
from fleet.models import Vehicle, Driver
from routing.models import Route, Stop
from identity.models import CustomUser
from datetime import timedelta
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Seeds mock analytics data (Trips, PassengerCounts) for the Dashboard'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Mock Analytics Data...")
        
        # Clean existing
        Trip.objects.all().delete()
        PassengerCount.objects.all().delete()

        try:
            route_138 = Route.objects.get(route_number="138")
            stops = list(Stop.objects.filter(route_connections__route=route_138).order_by('route_connections__order'))
            vehicle = Vehicle.objects.first()
            driver = Driver.objects.first()
        except Exception as e:
            self.stderr.write(f"Missing core data to seed analytics: {e}")
            self.stderr.write("Please run seed_mock_data and seed_mock_routes first.")
            return

        if not (route_138 and stops and vehicle and driver):
            self.stderr.write("Insufficient data. Ensure a Route, Stops, Vehicle, and Driver exist.")
            return

        # Create mock trips over the last 7 days
        now = timezone.now()
        for i in range(7):
            day = now - timedelta(days=i)
            # 5 trips per day
            for j in range(5):
                start_time = day.replace(hour=random.randint(6, 20), minute=0, second=0)
                end_time = start_time + timedelta(hours=1, minutes=random.randint(10, 45))
                
                trip = Trip.objects.create(
                    vehicle=vehicle,
                    driver=driver,
                    route=route_138,
                    start_time=start_time,
                    end_time=end_time,
                    status='completed'
                )

                # Generate passenger counts for this trip at various stops
                boarded_total = 0
                alighted_total = 0
                
                for stop in stops:
                    # Randomly board 0-15 passengers, alight 0-10
                    boarded = random.randint(0, 15)
                    alighted = random.randint(0, min(10, boarded_total + boarded))
                    
                    PassengerCount.objects.create(
                        trip=trip,
                        stop=stop,
                        timestamp=start_time + timedelta(minutes=random.randint(5, 55)),
                        boarding=boarded,
                        alighting=alighted
                    )
                    
                    boarded_total += boarded
                    alighted_total += alighted

        self.stdout.write(self.style.SUCCESS('Successfully seeded Analytics Data!'))
