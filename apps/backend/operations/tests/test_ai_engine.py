import pytest
from unittest.mock import patch
from operations.ai_engine import PredictiveEngine

def test_haversine_distance():
    # Test distance between two known points (e.g., Colombo to Kandy is ~95km)
    colombo = (6.9271, 79.8612)
    kandy = (7.2906, 80.6337)
    distance = PredictiveEngine.haversine_distance(colombo[0], colombo[1], kandy[0], kandy[1])
    
    # Assert distance is approximately correct
    assert 90 < distance < 100

@patch('operations.ai_engine.joblib.load')
def test_predict_eta_with_mocked_model(mock_joblib_load):
    # Mock the XGBoost model to prevent file loading during tests
    class MockModel:
        def predict(self, features):
            # Always predict 45 minutes for this test
            return [45.0]
            
    mock_joblib_load.return_value = MockModel()
    
    # Test ETA calculation
    result = PredictiveEngine.predict_eta(6.9271, 79.8612, 7.2906, 80.6337)
    
    assert 'eta_minutes' in result
    assert result['eta_minutes'] == 45
    assert 'condition' in result
    assert 'distance_km' in result

def test_predict_eta_fallback_math():
    # Force the model to fail loading
    PredictiveEngine._model = "FAILED"
    
    result = PredictiveEngine.predict_eta(6.9271, 79.8612, 7.2906, 80.6337)
    
    # The math calculation should kick in
    assert result['eta_minutes'] > 0
    assert result['distance_km'] > 90
