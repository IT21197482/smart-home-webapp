import React from 'react';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1>Welcome to Smart Home, {user?.email}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
};

export default Home;
