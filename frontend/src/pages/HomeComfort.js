import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import './HomeComfort.css';
import {
  FaThermometerHalf,
  FaTint,
  FaWind,
  FaSun,
  FaLightbulb,
  FaFan,
  FaSnowflake,
  FaWater,
  FaClock
} from 'react-icons/fa';

const firebaseConfig = {
  apiKey: "AIzaSyC90nJtEM4dqupHxQcZ20LfnCLjOKJYCJU",
  authDomain: "environmentalmonitoringdemo.firebaseapp.com",
  databaseURL: "https://environmentalmonitoringdemo-default-rtdb.firebaseio.com",
  projectId: "environmentalmonitoringdemo",
  storageBucket: "environmentalmonitoringdemo.appspot.com",
  messagingSenderId: "259439667227",
  appId: "1:259439667227:web:602379cfcea4e3dada30be"
};

const appName = "HomeComfortApp";
const app = getApps().find(app => app.name === appName) || initializeApp(firebaseConfig, appName);
const database = getDatabase(app);

const HomeComfort = () => {
  const [sensorData, setSensorData] = useState({
    temperature: '--',
    humidity: '--',
    air_quality: '--',
    light: '--'
  });
  const [deviceData, setDeviceData] = useState({
    AC: 'OFF',
    Fan: 'OFF',
    Heater: 'OFF',
    Humidifier: 'OFF',
    Light: 'OFF'
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);


  // Update the fetchBackend function
const fetchBackend = async () => {
  setIsRefreshing(true);
  try {
    await fetch('http://localhost:5000/run-model');
    // Add a small delay to show the refreshing state
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.error('Backend fetch failed:', err);
  }
  setIsRefreshing(false);
};

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleDevice = (deviceId) => {
    const newValue = deviceData[deviceId] === 'ON' ? 'OFF' : 'ON';
    set(ref(database, `device_control/${deviceId}`), newValue);
  };

  useEffect(() => {
    const sensorRef = ref(database, 'sensors');
    const deviceRef = ref(database, 'device_control');

    const sensorUnsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val() || {};
      setSensorData(prev => ({
        temperature: data.temperature || prev.temperature,
        humidity: data.humidity || prev.humidity,
        air_quality: data.air_quality || prev.air_quality,
        light: data.light || prev.light
      }));
    });

    const deviceUnsubscribe = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val() || {};
      setDeviceData(prev => ({
        AC: data.AC || prev.AC,
        Fan: data.Fan || prev.Fan,
        Heater: data.Heater || prev.Heater,
        Humidifier: data.Humidifier || prev.Humidifier,
        Light: data.Light || prev.Light
      }));
    });

    return () => {
      sensorUnsubscribe();
      deviceUnsubscribe();
    };
  }, []);

  const getAirQualityColor = (quality) => {
    if (!quality) return '#ffffff';
    if (quality === 'Good') return '#4CAF50';
    if (quality === 'Moderate') return '#FFC107';
    return '#F44336';
  };

  const getLightStatus = (light) => {
    if (!light) return '--';
    return light === 'Detected' ? 'Detected' : 'Not Detected';
  };

  return (
    <div className="home-comfort-container">
      <Navbar />
      <div className="hc-main-content">
        <div className="hc-header">
          <h1 className="hc-title">Home Comfort Dashboard</h1>
          <div className="hc-time-display">
            <FaClock className="hc-clock-icon" />
            <span>{currentTime.toLocaleDateString()}</span>
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
            <button
              onClick={fetchBackend}
              disabled={isRefreshing}
              className={`hc-refresh-btn ${isRefreshing ? 'hc-refreshing' : ''}`}
            >
              {isRefreshing ? (
                <>
                  <span className="hc-spinner"></span> REFRESHING...
                </>
              ) : (
                'REFRESH'
              )}
            </button>
        </div>

        <div className="hc-sensor-grid">
          {/* Temperature Card */}
          <div className="hc-sensor-card hc-temperature">
            <div className="hc-sensor-icon">
              <FaThermometerHalf />
            </div>
            <h3>Temperature</h3>
            <p className="hc-sensor-value">{sensorData.temperature}°C</p>
          </div>

          {/* Humidity Card */}
          <div className="hc-sensor-card hc-humidity">
            <div className="hc-sensor-icon">
              <FaTint />
            </div>
            <h3>Humidity</h3>
            <p className="hc-sensor-value">{sensorData.humidity}%</p>
          </div>

          {/* Air Quality Card */}
          <div className="hc-sensor-card hc-air-quality">
            <div className="hc-sensor-icon">
              <FaWind />
            </div>
            <h3>Air Quality</h3>
            <p 
              className="hc-sensor-value"
              style={{ color: getAirQualityColor(sensorData.air_quality) }}
            >
              {sensorData.air_quality}
            </p>
          </div>

          {/* Light Card */}
          <div className="hc-sensor-card hc-light">
            <div className="hc-sensor-icon">
              <FaSun />
            </div>
            <h3>Light</h3>
            <p className="hc-sensor-value">{getLightStatus(sensorData.light)}</p>
          </div>
        </div>

        <h2 className="hc-section-title">Device Control</h2>
        <div className="hc-device-grid">
          {/* AC Card */}
          <div className="hc-device-card">
            <div className="hc-device-icon">
              <FaSnowflake />
            </div>
            <h3>Air Conditioner</h3>
            <p className={`hc-device-status ${deviceData.AC === 'ON' ? 'hc-on' : 'hc-off'}`}>
              {deviceData.AC}
            </p>
            <button
              className={`hc-toggle-btn ${deviceData.AC === 'ON' ? 'hc-on' : 'hc-off'}`}
              onClick={() => toggleDevice('AC')}
            >
              {deviceData.AC === 'ON' ? 'TURN OFF' : 'TURN ON'}
            </button>
          </div>

          {/* Fan Card */}
          <div className="hc-device-card">
            <div className="hc-device-icon">
              <FaFan />
            </div>
            <h3>Fan</h3>
            <p className={`hc-device-status ${deviceData.Fan === 'ON' ? 'hc-on' : 'hc-off'}`}>
              {deviceData.Fan}
            </p>
            <button
              className={`hc-toggle-btn ${deviceData.Fan === 'ON' ? 'hc-on' : 'hc-off'}`}
              onClick={() => toggleDevice('Fan')}
            >
              {deviceData.Fan === 'ON' ? 'TURN OFF' : 'TURN ON'}
            </button>
          </div>

          {/* Heater Card */}
          <div className="hc-device-card">
            <div className="hc-device-icon">
              <FaThermometerHalf />
            </div>
            <h3>Heater</h3>
            <p className={`hc-device-status ${deviceData.Heater === 'ON' ? 'hc-on' : 'hc-off'}`}>
              {deviceData.Heater}
            </p>
            <button
              className={`hc-toggle-btn ${deviceData.Heater === 'ON' ? 'hc-on' : 'hc-off'}`}
              onClick={() => toggleDevice('Heater')}
            >
              {deviceData.Heater === 'ON' ? 'TURN OFF' : 'TURN ON'}
            </button>
          </div>

          {/* Humidifier Card */}
          <div className="hc-device-card">
            <div className="hc-device-icon">
              <FaWater />
            </div>
            <h3>Humidifier</h3>
            <p className={`hc-device-status ${deviceData.Humidifier === 'ON' ? 'hc-on' : 'hc-off'}`}>
              {deviceData.Humidifier}
            </p>
            <button
              className={`hc-toggle-btn ${deviceData.Humidifier === 'ON' ? 'hc-on' : 'hc-off'}`}
              onClick={() => toggleDevice('Humidifier')}
            >
              {deviceData.Humidifier === 'ON' ? 'TURN OFF' : 'TURN ON'}
            </button>
          </div>

          {/* Light Card */}
          <div className="hc-device-card">
            <div className="hc-device-icon">
              <FaLightbulb />
            </div>
            <h3>Light</h3>
            <p className={`hc-device-status ${deviceData.Light === 'ON' ? 'hc-on' : 'hc-off'}`}>
              {deviceData.Light}
            </p>
            <button
              className={`hc-toggle-btn ${deviceData.Light === 'ON' ? 'hc-on' : 'hc-off'}`}
              onClick={() => toggleDevice('Light')}
            >
              {deviceData.Light === 'ON' ? 'TURN OFF' : 'TURN ON'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeComfort;