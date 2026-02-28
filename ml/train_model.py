import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import pickle
import os

# ─── Load Data ────────────────────────────────────────────────
df = pd.read_csv("../data/delay_data.csv")
print(f"✅ Loaded {len(df)} records")

# ─── Prepare Features ─────────────────────────────────────────
# Convert train_type to numbers (ML only understands numbers)
df["train_type_encoded"] = df["train_type"].map({
    "Rajdhani": 0,
    "Mail": 1,
    "Express": 2
})

features = [
    "train_id",
    "train_type_encoded",
    "station_id",
    "day_of_week",
    "hour",
    "is_peak_hour",
    "is_weekend"
]

X = df[features]
y = df["delay_minutes"]

# ─── Split Data ───────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"Training samples: {len(X_train)}")
print(f"Testing samples : {len(X_test)}")

# ─── Train Model ──────────────────────────────────────────────
print("\n🔄 Training model...")
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)
model.fit(X_train, y_train)
print("✅ Model trained!")

# ─── Evaluate Model ───────────────────────────────────────────
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\n📊 Model Performance:")
print(f"   Mean Absolute Error : {mae:.2f} minutes")
print(f"   R2 Score            : {r2:.2f}")

# ─── Feature Importance ───────────────────────────────────────
print(f"\n🔍 Feature Importance:")
for feat, imp in sorted(zip(features, model.feature_importances_), 
                         key=lambda x: x[1], reverse=True):
    print(f"   {feat:25s} : {imp:.3f}")

# ─── Save Model ───────────────────────────────────────────────
os.makedirs("../ml", exist_ok=True)
with open("../ml/delay_model.pkl", "wb") as f:
    pickle.dump(model, f)
print(f"\n✅ Model saved to ml/delay_model.pkl")