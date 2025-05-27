import pickle
import numpy as np
import os
import datetime
import firebase_admin
from firebase_admin import credentials, db

# Load ML model
model_path = os.path.join(os.path.dirname(__file__), '..', 'model.pkl')
with open(model_path, 'rb') as f:
    model = pickle.load(f)

# Firebase initialization (do this once!)
firebase_config_path = os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json')
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_config_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://smarthome-app-4d61e-default-rtdb.asia-southeast1.firebasedatabase.app'  # Replace with your actual DB URL
    })

def predict_energy(data):
    hour = int(data.get('hour', 12))
    minute = int(data.get('minute', 0))
    input_array = np.array([[hour, minute]])
    predicted_power = model.predict(input_array)[0]
    hours_per_day = 6
    days = 30
    monthly_kwh = (predicted_power * hours_per_day * days) / 1000
    cost = monthly_kwh * 20.3
    return {
        "predicted_power_watt": round(predicted_power, 2),
        "monthly_kwh": round(monthly_kwh, 2),
        "total_cost_lkr": round(cost, 2)
    }

def predict_24h():
    result = []
    for hour in range(24):
        input_array = np.array([[hour, 0]])
        predicted_power = model.predict(input_array)[0]
        result.append({
            "hour": f"{hour}:00",
            "power": round(predicted_power, 2)
        })
    return result

def predict_weeks():
    ref = db.reference('usage_logs')
    logs = ref.get()

    if not logs:
        return {f"Week {i+1}": 0 for i in range(4)}

    weekly_kwh = [0, 0, 0, 0]
    for device_id, usage_data in logs.items():
        for timestamp, watt in usage_data.items():
            try:
                dt = datetime.datetime.fromisoformat(timestamp)
                week_index = (dt.day - 1) // 7
                kwh = watt / 1000.0  # assuming 1-hour logs
                if 0 <= week_index < 4:
                    weekly_kwh[week_index] += kwh
            except Exception as e:
                print(f"Skipping malformed timestamp {timestamp}: {e}")

    return {f"Week {i+1}": round(val, 2) for i, val in enumerate(weekly_kwh)}
