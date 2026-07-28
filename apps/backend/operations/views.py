from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Trip, Tracking, PassengerCount
from .serializers import TripSerializer, TrackingSerializer, PassengerCountSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

class TrackingViewSet(viewsets.ModelViewSet):
    queryset = Tracking.objects.all()
    serializer_class = TrackingSerializer
    permission_classes = [IsAuthenticated]

class PassengerCountViewSet(viewsets.ModelViewSet):
    queryset = PassengerCount.objects.all()
    serializer_class = PassengerCountSerializer
    permission_classes = [IsAuthenticated]

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from routing.models import Stop
from .ai_engine import PredictiveEngine

class PredictETAView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_id = request.query_params.get('start_stop_id')
        end_id = request.query_params.get('end_stop_id')

        if not start_id or not end_id:
            return Response({"error": "start_stop_id and end_stop_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start_stop = Stop.objects.get(id=start_id)
            end_stop = Stop.objects.get(id=end_id)
        except Stop.DoesNotExist:
            return Response({"error": "Stop not found"}, status=status.HTTP_404_NOT_FOUND)

        prediction = PredictiveEngine.predict_eta(
            start_stop.latitude, start_stop.longitude,
            end_stop.latitude, end_stop.longitude
        )

        return Response(prediction)

from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        
        # Total active trips today
        active_trips_count = Trip.objects.filter(start_time__gte=last_24h).count()
        
        # Total passengers boarded last 24h
        passengers_today = PassengerCount.objects.filter(timestamp__gte=last_24h).aggregate(total=Sum('boarding'))['total'] or 0
        
        # Estimated revenue (mock: 50 LKR per passenger)
        estimated_revenue = passengers_today * 50

        # Passenger Volume trend (last 7 days by day)
        trend = []
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0)
            day_end = day_start + timedelta(days=1)
            daily_passengers = PassengerCount.objects.filter(timestamp__gte=day_start, timestamp__lt=day_end).aggregate(total=Sum('boarding'))['total'] or 0
            trend.append({
                "date": day_start.strftime('%a'),
                "passengers": daily_passengers
            })

        return Response({
            "active_trips": active_trips_count,
            "passengers_today": passengers_today,
            "estimated_revenue": estimated_revenue,
            "trend": trend
        })
