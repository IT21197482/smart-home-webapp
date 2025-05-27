from flask import Flask, request, jsonify
from flask_cors import CORS
from controllers.iot_controller import update_device_state, get_device_state
from models.prediction_model import predict_energy, predict_24h, predict_weeks

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "Smart Home Flask API is running."

# Machine Learning Prediction (single point)
@app.route('/api/predict', methods=['POST'])
def get_prediction():
    data = request.get_json()
    prediction = predict_energy(data)
    return jsonify(prediction)

# 24-Hour Forecast (for graph)
@app.route('/api/predict/24h', methods=['GET'])
def get_daily_prediction():
    return jsonify(predict_24h())

# Weekly Forecast (new endpoint)
@app.route('/api/predict/weeks', methods=['GET'])
def get_weekly_prediction():
    return jsonify(predict_weeks())

# Control a device
@app.route('/api/device/<device_name>', methods=['POST'])
def control_device(device_name):
    state = request.json.get('state')
    update_device_state(device_name, state)
    return jsonify({"status": "updated", "device": device_name, "state": state})

# Read device state
@app.route('/api/device/<device_name>', methods=['GET'])
def read_device(device_name):
    state = get_device_state(device_name)
    return jsonify({"device": device_name, "state": state})

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
