import math
import os
import joblib
import pandas as pd
from datetime import datetime

class PredictiveEngine:
    # Load model once at class level
    _model = None
    
    @classmethod
    def _load_model(cls):
        if cls._model is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(current_dir, "ml", "eta_xgboost_model.joblib")
            try:
                cls._model = joblib.load(model_path)
            except Exception as e:
                print(f"Warning: Failed to load ETA model: {e}")
                cls._model = "FAILED"
        return cls._model

    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        R = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    @classmethod
    def predict_eta(cls, start_lat, start_lng, end_lat, end_lng):
        distance_km = cls.haversine_distance(start_lat, start_lng, end_lat, end_lng)
        
        now = datetime.now()
        hour_of_day = now.hour
        day_of_week = now.weekday()
        
        # In a real system, you would pull real-time weather and holiday APIs.
        # For now, we simulate typical Sri Lankan conditions for prediction.
        is_raining = 0 
        is_holiday = 0
        
        # Evaluate traffic condition string for UI
        condition = "Clear"
        if 7 <= hour_of_day <= 9 or 16 <= hour_of_day <= 19:
            condition = "Heavy Traffic"
        elif 10 <= hour_of_day <= 15:
            condition = "Moderate Traffic"
            
        model = cls._load_model()
        
        if model == "FAILED" or model is None:
            # Fallback to math calculation if model is missing
            base_time_hours = distance_km / 40.0
            eta_minutes = int(base_time_hours * 60 * (1.5 if "Traffic" in condition else 1.0))
        else:
            # Prepare feature DataFrame matching training data
            features = pd.DataFrame([{
                "distance_km": distance_km,
                "hour_of_day": hour_of_day,
                "day_of_week": day_of_week,
                "is_raining": is_raining,
                "is_holiday": is_holiday
            }])
            
            # Predict using XGBoost
            predicted_minutes = model.predict(features)[0]
            eta_minutes = int(round(predicted_minutes))
            
        if eta_minutes < 1:
            eta_minutes = 1

        return {
            "eta_minutes": eta_minutes,
            "condition": condition,
            "distance_km": round(distance_km, 2)
        }
