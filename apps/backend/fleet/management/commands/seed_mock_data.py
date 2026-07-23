from django.core.management.base import BaseCommand
from fleet.models import Vehicle, Driver
from identity.models import CustomUser
from django.contrib.auth.hashers import make_password
import random

class Command(BaseCommand):
    help = 'Seeds the database with mock Fleet data for UI testing'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Vehicles...")
        statuses = [Vehicle.StatusChoices.ACTIVE, Vehicle.StatusChoices.MAINTENANCE, Vehicle.StatusChoices.OUT_OF_SERVICE]
        
        vehicles_created = 0
        for i in range(1, 26):
            reg_num = f"WP-ND-{1000 + i}"
            if not Vehicle.objects.filter(registration_number=reg_num).exists():
                status = random.choices(statuses, weights=[0.8, 0.15, 0.05])[0]
                Vehicle.objects.create(
                    registration_number=reg_num,
                    capacity=random.choice([40, 50, 60]),
                    status=status
                )
                vehicles_created += 1

        self.stdout.write(f"Successfully seeded {vehicles_created} Vehicles.")

        self.stdout.write("Seeding Drivers...")
        drivers_created = 0
        driver_statuses = [Driver.StatusChoices.AVAILABLE, Driver.StatusChoices.ON_DUTY, Driver.StatusChoices.OFF_DUTY]
        
        for i in range(1, 16):
            email = f"driver{i}@optitransit.lk"
            if not CustomUser.objects.filter(email=email).exists():
                user = CustomUser.objects.create(
                    email=email,
                    password=make_password('driver123'),
                )
                Driver.objects.create(
                    user=user,
                    license_number=f"DL-{100000 + i}",
                    status=random.choice(driver_statuses)
                )
                drivers_created += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {drivers_created} Drivers."))
