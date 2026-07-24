from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Vehicle, Driver
from .serializers import VehicleSerializer, DriverSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.filter(is_deleted=False)
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
