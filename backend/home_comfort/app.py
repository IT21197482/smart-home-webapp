from flask import Flask, jsonify
import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime, time
import numpy as np
import joblib
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from flask_cors import CORS

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Load ML models
comfort_model = joblib.load('comfort_model.pkl')
light_model = joblib.load('light_model.pkl')

# Initialize Firebase
cred = credentials.Certificate('firebase_key.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://environmentalmonitoringdemo-default-rtdb.firebaseio.com'
})

app = Flask(__name__)
CORS(app) 

def get_occupancy_by_time():
    now = datetime.now().time()
    if time(6, 0) <= now < time(8, 0):
        return 1
    elif time(8, 0) <= now < time(17, 0):
        return 0
    elif time(17, 0) <= now < time(21, 30):
        return 1
    else:
        return 0

@app.route('/')
def home():
    return 'API is running!'

@app.route('/run-model', methods=['GET'])
def run_model():
    try:
        # 1. Read sensor data from Firebase
        ref = db.reference('sensors')
        sensor_data = ref.get()

        if not sensor_data:
            return jsonify({'error': 'No sensor data found'}), 404

        # 2. Extract & transform
        temperature = float(sensor_data.get('temperature', 0))
        humidity = float(sensor_data.get('humidity', 0))
        light_str = sensor_data.get('light', 'Not Detected')
        light = 1 if light_str.lower() == 'detected' else 0
        air_quality_str = sensor_data.get('air_quality', 'Good')
        air_quality_map = {"Good": 0, "Moderate": 1, "Poor": 2}
        air_quality = air_quality_map.get(air_quality_str, 0)
        occupancy = get_occupancy_by_time()

        features = np.array([[temperature, humidity, light, air_quality, occupancy]])

        # 3. ML predictions
        comfort_pred = int(comfort_model.predict(features)[0])
        light_pred = int(light_model.predict(features)[0])

        # 4. Prompt OpenAI for device control
        prompt = f"""Given this data:
- Temperature: {temperature}°C
- Humidity: {humidity}%
- Light: {'Not Detected' if light == 1 else 'Detected'}
- Air Quality: {air_quality_str}
- Comfort Prediction: {comfort_pred}
- Light Prediction: {light_pred}

Suggest which devices should be turned ON or OFF:
Fan, AC, Light, Heater, Humidifier.
Only reply in JSON like:
{{ "Fan": "ON", "AC": "OFF", "Light": "ON", "Heater": "OFF", "Humidifier": "OFF" }}
"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a smart environmental device controller."},
                {"role": "user", "content": prompt}
            ]
        )

        # Parse OpenAI JSON reply
        ai_reply = response.choices[0].message.content.strip()
        devices = json.loads(ai_reply)



        # 5. Write predictions and control to Firebase
        db.reference('prediction_result').set({
            'comfort_prediction': comfort_pred,
            'light_prediction': light_pred
        })

        db.reference('device_control').set(devices)

        # 6. Return response
        return jsonify({
            'comfort_prediction': comfort_pred,
            'light_prediction': light_pred,
            'device_control': devices
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
