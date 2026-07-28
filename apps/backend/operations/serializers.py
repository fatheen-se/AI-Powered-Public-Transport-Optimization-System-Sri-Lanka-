from rest_framework import serializers
from .models import Trip, Tracking, PassengerCount

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

class TrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tracking
        fields = '__all__'

class PassengerCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassengerCount
        fields = '__all__'
