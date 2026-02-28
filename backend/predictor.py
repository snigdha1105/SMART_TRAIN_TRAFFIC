import pickle
import numpy as np

# Load the trained model
with open("../ml/delay_model.pkl", "rb") as f:
    model = pickle.load(f)

def predict_delay(
    train_id: int,
    train_type: str,
    station_id: int,
    day_of_week: int,
    hour: int
) -> dict:
    
    train_type_map = {"Rajdhani": 0, "Mail": 1, "Express": 2}
    train_type_encoded = train_type_map.get(train_type, 1)
    
    is_peak_hour = 1 if hour in [8, 9, 17, 18, 19] else 0
    is_weekend = 1 if day_of_week >= 5 else 0

    features = np.array([[
        train_id,
        train_type_encoded,
        station_id,
        day_of_week,
        hour,
        is_peak_hour,
        is_weekend
    ]])

    predicted_delay = model.predict(features)[0]
    predicted_delay = max(0, round(predicted_delay, 1))

    # Risk level based on delay
    if predicted_delay <= 5:
        risk = "LOW"
    elif predicted_delay <= 15:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    return {
        "predicted_delay_minutes": predicted_delay,
        "risk_level": risk,
        "is_peak_hour": bool(is_peak_hour),
        "is_weekend": bool(is_weekend)
    }