from datetime import datetime
from firebase_config import db

def update_device_state(device_name, state):
    """
    Updates the on/off state of a device in Firebase.
    """
    ref = db.reference(f'devices/{device_name}')
    ref.set(state)

def get_device_state(device_name):
    """
    Retrieves the current on/off state of a device from Firebase.
    """
    ref = db.reference(f'devices/{device_name}')
    return ref.get()

def log_power_usage(device_name, power_value):
    """
    Logs real-time power consumption per device, per hour.
    Example path: usage_logs/fan1/2025-05-27T14:00
    """
    timestamp = datetime.now().strftime("%Y-%m-%dT%H:00")  # Hour resolution
    usage_ref = db.reference(f'usage_logs/{device_name}/{timestamp}')
    usage_ref.set(power_value)
