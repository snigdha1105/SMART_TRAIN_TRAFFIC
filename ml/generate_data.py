import pandas as pd
import numpy as np
import random
import os

random.seed(42)
np.random.seed(42)

stations = [
    {"id": 1, "name": "New Delhi"},
    {"id": 2, "name": "Mumbai Central"},
    {"id": 3, "name": "Mathura Junction"},
    {"id": 4, "name": "Kota Junction"}
]

trains = [
    {"id": 1, "name": "Mumbai Rajdhani", "type": "Rajdhani"},
    {"id": 2, "name": "August Kranti", "type": "Rajdhani"},
    {"id": 3, "name": "Saurashtra Mail", "type": "Mail"}
]

train_type_delay = {
    "Rajdhani": 5,   # usually less delayed
    "Mail": 15       # usually more delayed
}

records = []

for _ in range(2000):
    train = random.choice(trains)
    station = random.choice(stations)
    day_of_week = random.randint(0, 6)
    hour = random.randint(0, 23)
    is_peak_hour = 1 if hour in [8, 9, 17, 18, 19] else 0
    is_weekend = 1 if day_of_week >= 5 else 0

    base_delay = train_type_delay[train["type"]]
    delay = (
        base_delay
        + is_peak_hour * random.randint(5, 15)
        + is_weekend * random.randint(2, 8)
        + random.randint(-3, 20)
    )
    delay = max(0, delay)

    records.append({
        "train_id": train["id"],
        "train_type": train["type"],
        "station_id": station["id"],
        "day_of_week": day_of_week,
        "hour": hour,
        "is_peak_hour": is_peak_hour,
        "is_weekend": is_weekend,
        "delay_minutes": delay
    })

df = pd.DataFrame(records)
os.makedirs("../data", exist_ok=True)
df.to_csv("../data/delay_data.csv", index=False)
print(f"✅ Generated {len(df)} records!")
print(df.head())
print(f"\nAverage delay: {df['delay_minutes'].mean():.2f} minutes")