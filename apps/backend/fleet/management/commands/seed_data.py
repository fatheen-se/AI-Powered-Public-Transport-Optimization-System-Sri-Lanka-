from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from identity.models import Role
from fleet.models import Vehicle, Driver

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with test data for Sri Lankan routes'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")

        # Create Roles
        driver_role, _ = Role.objects.get_or_create(name="Driver")
        passenger_role, _ = Role.objects.get_or_create(name="Passenger")

        # Create Admin
        if not User.objects.filter(email="admin@srilankatransit.com").exists():
            User.objects.create_superuser("admin@srilankatransit.com", "admin123")
            self.stdout.write(self.style.SUCCESS('Created Admin User'))

        # Create Mock Driver User
        user, _ = User.objects.get_or_create(
            email="driver1@srilankatransit.com",
            defaults={"role": driver_role}
        )
        if _:
            user.set_password("driver123")
            user.save()
            self.stdout.write(self.style.SUCCESS('Created Mock Driver User'))

        # Create Driver Profile
        driver, created = Driver.objects.get_or_create(
            user=user,
            defaults={"license_number": "DL-00123"}
        )

        # Create Mock Passenger
        passenger, _ = User.objects.get_or_create(
            email="passenger1@srilankatransit.com",
            defaults={"role": passenger_role}
        )
        if _:
            passenger.set_password("passenger123")
            passenger.save()
            self.stdout.write(self.style.SUCCESS('Created Mock Passenger'))

        # Create a Vehicle (Bus)
        Vehicle.objects.get_or_create(
            registration_number="ND-1234",
            defaults={"capacity": 54}
        )
        self.stdout.write(self.style.SUCCESS('Created Vehicle ND-1234'))

        self.stdout.write(self.style.SUCCESS("Database Seeding Completed Successfully!"))
