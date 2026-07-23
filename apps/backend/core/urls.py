"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from fleet.views import VehicleViewSet, DriverViewSet
from routing.views import StopViewSet, RouteViewSet, RouteStopViewSet
from operations.views import TripViewSet, TrackingViewSet, PassengerCountViewSet, PredictETAView, AnalyticsSummaryView

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'drivers', DriverViewSet, basename='driver')
router.register(r'stops', StopViewSet, basename='stop')
router.register(r'routes', RouteViewSet, basename='route')
router.register(r'route-stops', RouteStopViewSet, basename='routestop')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'tracking', TrackingViewSet, basename='tracking')
router.register(r'passenger-counts', PassengerCountViewSet, basename='passengercount')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),
    path("api/v1/operations/predict-eta/", PredictETAView.as_view(), name='predict_eta'),
    path("api/v1/operations/analytics-summary/", AnalyticsSummaryView.as_view(), name='analytics_summary'),
    path("api/v1/", include(router.urls)),
]
