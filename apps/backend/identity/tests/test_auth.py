import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def passenger_user(db):
    return User.objects.create_user(
        email="passenger@test.com",
        password="testpassword123",
        is_passenger=True
    )

@pytest.fixture
def driver_user(db):
    return User.objects.create_user(
        email="driver@test.com",
        password="testpassword123",
        is_driver=True
    )

@pytest.mark.django_db
def test_user_creation(passenger_user):
    assert passenger_user.email == "passenger@test.com"
    assert passenger_user.is_passenger is True
    assert passenger_user.is_driver is False

@pytest.mark.django_db
def test_jwt_token_generation(api_client, passenger_user):
    response = api_client.post('/api/token/', {
        'email': 'passenger@test.com',
        'password': 'testpassword123'
    }, format='json')
    
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data

@pytest.mark.django_db
def test_invalid_login(api_client, passenger_user):
    response = api_client.post('/api/token/', {
        'email': 'passenger@test.com',
        'password': 'wrongpassword'
    }, format='json')
    
    assert response.status_code == 401
