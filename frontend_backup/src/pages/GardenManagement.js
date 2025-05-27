import React from 'react';
import Navbar from '../components/Navbar';

const GardenManagement = () => {
  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2>Garden Management</h2>
        <p>Soil moisture, irrigation, and plant health monitoring.</p>
      </div>
    </>
  );
};

export default GardenManagement;
