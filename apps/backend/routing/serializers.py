from rest_framework import serializers
from .models import Stop, Route, RouteStop

class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = '__all__'

class RouteStopSerializer(serializers.ModelSerializer):
    stop_name = serializers.ReadOnlyField(source='stop.name')
    class Meta:
        model = RouteStop
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    route_stops = RouteStopSerializer(many=True, read_only=True)
    start_location = StopSerializer(read_only=True)
    end_location = StopSerializer(read_only=True)
    class Meta:
        model = Route
        fields = '__all__'
