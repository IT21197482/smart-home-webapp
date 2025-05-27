import React, { useEffect, useState } from 'react';
import { ref, set } from 'firebase/database';
import { useObjectVal } from 'react-firebase-hooks/database';
import { database } from '../firebase';
import Navbar from '../components/Navbar';
import '../styles/theme.css';
import EnergyChart from '../components/EnergyChart';
import PowerForecastChart from '../components/PowerForecastChart';
import axios from 'axios';
import deviceData from '../components/deviceData';
import {
  FaTv,
  FaFan,
  FaLightbulb,
  FaAirFreshener,
  FaPlug,
  FaBolt,
  FaTachometerAlt,
  FaChargingStation
} from 'react-icons/fa';

const EnergyManagement = () => {
  const [realtime] = useObjectVal(ref(database, 'realtime'));
  const [devices] = useObjectVal(ref(database, 'devices'));
  const [alerts] = useObjectVal(ref(database, 'alerts'));

  const [mlPrediction, setMlPrediction] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    axios.post('http://127.0.0.1:5000/api/predict', { hour, minute })
      .then(res => {
        setMlPrediction(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Prediction API error:', err);
        setLoading(false);
      });

    axios.get('http://127.0.0.1:5000/api/predict/24h')
      .then(res => setHourlyForecast(res.data))
      .catch(err => console.error('24h forecast error:', err));
  }, []);

  const toggleDevice = (id, currentValue) => {
    set(ref(database, `devices/${id}`), !currentValue);
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'tv': return <FaTv />;
      case 'fan': return <FaFan />;
      case 'lamp':
      case 'light': return <FaLightbulb />;
      case 'ac':
      case 'plug':
      case 'heater':
      case 'fridge':
      case 'microwave': return <FaPlug />;
      default: return <FaAirFreshener />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2>Energy Management</h2>

        {/* Live Energy Usage */}
        <div className="card">
          <h3>Live Energy Usage</h3>
          <div className="card-data-grid">
            <div className="card-data-item">
              <div className="card-data-icon"><FaTachometerAlt /></div>
              <h4>Current</h4>
              <span>{realtime?.current ?? '--'} A</span>
            </div>
            <div className="card-data-item">
              <div className="card-data-icon"><FaBolt /></div>
              <h4>Voltage</h4>
              <span>{realtime?.voltage ?? '--'} V</span>
            </div>
            <div className="card-data-item">
              <div className="card-data-icon"><FaChargingStation /></div>
              <h4>Power</h4>
              <span>{realtime?.power ?? '--'} W</span>
            </div>
          </div>
        </div>

        {/* ML Predictions */}
        <div className="card">
          <h3>ML Predictions</h3>
          {loading ? (
            <p>Fetching predictions...</p>
          ) : mlPrediction ? (
            <div className="card-data-grid">
              <div className="card-data-item">
                <div className="card-data-icon"><FaChargingStation /></div>
                <h4>Predicted Usage</h4>
                <span>{mlPrediction.predicted_power_watt} W</span>
              </div>
              <div className="card-data-item">
                <div className="card-data-icon"><FaBolt /></div>
                <h4>Monthly Usage</h4>
                <span>{mlPrediction.monthly_kwh} kWh</span>
              </div>
              <div className="card-data-item">
                <div className="card-data-icon"><FaPlug /></div>
                <h4>Monthly Cost</h4>
                <span>LKR {mlPrediction.total_cost_lkr}</span>
              </div>
            </div>
          ) : (
            <p>Failed to load prediction.</p>
          )}
        </div>

        {/* Monthly Forecast Chart */}
        {mlPrediction && (
          <EnergyChart
            data={[
              { label: 'Week 1', kwh: mlPrediction.monthly_kwh * 0.25 },
              { label: 'Week 2', kwh: mlPrediction.monthly_kwh * 0.25 },
              { label: 'Week 3', kwh: mlPrediction.monthly_kwh * 0.25 },
              { label: 'Week 4', kwh: mlPrediction.monthly_kwh * 0.25 },
            ]}
          />
        )}

        {/* 24-Hour Forecast Chart */}
        {hourlyForecast.length > 0 && (
          <PowerForecastChart data={hourlyForecast} />
        )}

        {/* Device Control */}
        <div className="card">
          <h3>Device Control</h3>
          {devices && Object.keys(deviceData).map(room => (
            <div key={room} className="device-room-group">
              <h4>{room.replace('_', ' ').toUpperCase()}</h4>
              <div className="device-grid">
                {deviceData[room].map(device => (
                  <div key={device.id} className="device-card">
                    <div className="device-icon">{renderIcon(device.type)}</div>
                    <div className="device-info">
                      <h5>{device.name}</h5>
                      <p>Status: {devices[device.id] ? 'ON' : 'OFF'}</p>
                      <p>Usage: {device.usage} W</p>
                      <button
                        onClick={() => toggleDevice(device.id, devices[device.id])}
                        className={`device-toggle ${devices[device.id] ? 'on' : 'off'}`}
                      >
                        {devices[device.id] ? 'Turn Off' : 'Turn On'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {alerts?.overuse && (
          <div className="alert">
            <strong>⚠️ Alert:</strong> {alerts.device_alert}
          </div>
        )}
      </div>
    </>
  );
};

export default EnergyManagement;
