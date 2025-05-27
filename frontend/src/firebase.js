import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCHWNM3cb1LAxEJVpv8tVMCvt4l8uLx1Lo",
  authDomain: "smarthome-app-4d61e.firebaseapp.com",
  databaseURL: "https://smarthome-app-4d61e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smarthome-app-4d61e",
  storageBucket: "smarthome-app-4d61e.appspot.com", // ✅ FIXED HERE
  messagingSenderId: "480685905959",
  appId: "1:480685905959:web:85706b430ac27d13b39602"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
