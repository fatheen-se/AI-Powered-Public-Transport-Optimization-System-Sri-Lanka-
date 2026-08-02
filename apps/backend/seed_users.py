import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from identity.models import CustomUser, Role

def seed_test_users():
    roles = ['PASSENGER', 'AUTHORITY', 'DRIVER', 'ADMIN']
    
    # Ensure roles exist
    for role_name in roles:
        Role.objects.get_or_create(name=role_name)
        
    users_to_create = [
        {'email': 'passenger@example.com', 'role': 'PASSENGER'},
        {'email': 'authority@example.com', 'role': 'AUTHORITY'},
        {'email': 'driver@example.com', 'role': 'DRIVER'},
        {'email': 'admin@example.com', 'role': 'ADMIN'},
    ]
    
    for u in users_to_create:
        role = Role.objects.get(name=u['role'])
        user, created = CustomUser.objects.get_or_create(email=u['email'], defaults={'role': role})
        if created:
            user.set_password('password123')
            user.save()
            print(f"Created {u['email']}")
        else:
            # Ensure password is correct
            user.set_password('password123')
            user.role = role
            user.save()
            print(f"Updated {u['email']}")
            
if __name__ == '__main__':
    seed_test_users()
