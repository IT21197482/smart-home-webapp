import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2>Smart Home</h2>
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/energy">Energy</Link></li>
        <li><Link to="/comfort">Comfort</Link></li>
        <li><Link to="/security">Security</Link></li>
        <li><Link to="/garden">Garden</Link></li>
        <li><Link to="/login">Logout</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
