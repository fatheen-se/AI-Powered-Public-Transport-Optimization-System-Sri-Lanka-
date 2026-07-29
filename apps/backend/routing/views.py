from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Stop, Route, RouteStop
from .serializers import StopSerializer, RouteSerializer, RouteStopSerializer

class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.all()
    serializer_class = StopSerializer
    permission_classes = [IsAuthenticated]

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.filter(is_deleted=False)
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]

class RouteStopViewSet(viewsets.ModelViewSet):
    queryset = RouteStop.objects.all()
    serializer_class = RouteStopSerializer
    permission_classes = [IsAuthenticated]
