import firebase_admin
from firebase_admin import credentials, db
import os

# Path to Firebase service account key
cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')

# Updated Firebase DB URL (from error message)
database_url = "https://smarthome-app-4d61e-default-rtdb.asia-southeast1.firebasedatabase.app/"

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {'databaseURL': database_url})
