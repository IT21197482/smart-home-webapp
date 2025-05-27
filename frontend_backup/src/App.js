import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import EnergyManagement from './pages/EnergyManagement';
import ComfortOptimization from './pages/HomeComfort';
import Security from './pages/Security';
import GardenManagement from './pages/GardenManagement';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/energy" element={<EnergyManagement />} />
          <Route path="/comfort" element={<ComfortOptimization />} />
          <Route path="/security" element={<Security />} />
          <Route path="/garden" element={<GardenManagement />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
