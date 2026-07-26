import csv
import random
import os
from datetime import datetime, timedelta

def generate_synthetic_data(num_records=10000, output_path="synthetic_bus_trips.csv"):
    """
    Generates synthetic historical bus trip data for training the AI ETA model.
    """
    headers = [
        "trip_id",
        "distance_km",
        "hour_of_day",
        "day_of_week",
        "is_raining",
        "is_holiday",
        "actual_duration_minutes"
    ]
    
    records = []
    
    # Base speeds in km/h depending on conditions
    BASE_SPEED = 40.0
    
    for i in range(num_records):
        distance_km = round(random.uniform(1.0, 30.0), 2)
        hour_of_day = random.randint(0, 23)
        day_of_week = random.randint(0, 6) # 0=Monday, 6=Sunday
        is_raining = random.choice([0, 1])
        is_holiday = random.choice([0, 1])
        
        # Calculate a realistic duration based on features
        speed_multiplier = 1.0
        
        # Rush hours
        if 7 <= hour_of_day <= 9 or 16 <= hour_of_day <= 19:
            speed_multiplier -= 0.4
            
        # Night time is faster
        if 22 <= hour_of_day or hour_of_day <= 5:
            speed_multiplier += 0.2
            
        # Weekends are slightly faster
        if day_of_week >= 5:
            speed_multiplier += 0.1
            
        # Rain slows things down
        if is_raining:
            speed_multiplier -= 0.2
            
        # Holidays are faster
        if is_holiday:
            speed_multiplier += 0.2
            
        # Clamp multiplier
        speed_multiplier = max(0.3, speed_multiplier)
        
        actual_speed = BASE_SPEED * speed_multiplier
        
        # Base time
        duration_hours = distance_km / actual_speed
        duration_minutes = duration_hours * 60
        
        # Add random noise (accidents, passenger loading delays, etc.)
        noise = random.uniform(-0.1, 0.2) * duration_minutes
        
        final_duration = int(duration_minutes + noise)
        final_duration = max(1, final_duration) # Minimum 1 minute
        
        records.append([
            f"TRIP_{i+1000}",
            distance_km,
            hour_of_day,
            day_of_week,
            is_raining,
            is_holiday,
            final_duration
        ])

    with open(output_path, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(records)
        
    print(f"Successfully generated {num_records} synthetic trips to {output_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_csv = os.path.join(current_dir, "synthetic_bus_trips.csv")
    generate_synthetic_data(10000, output_csv)
