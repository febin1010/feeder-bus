// src/components/IndexPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './IndexPage.css'; 
import { FaUserShield, FaBus } from 'react-icons/fa';
import logo from './KMRL-logo.png'; // Import the logo

const IndexPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4 animate-gradient">
      {/* Logo */}
      <img src={logo} alt="KMRL Logo" className="w-32 h-24 mb-6 "style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }} />

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 text-center animate-pulse">
        Welcome to Feeder Bus System
      </h1>
      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/admin-login')}
          className="w-full py-3 px-6 bg-green-600 text-white text-lg rounded-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <FaUserShield className="mr-2" /> Admin Login
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 px-6 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <FaBus className="mr-2" /> Driver Login
        </button>
      </div>
    </div>
  );
};

export default IndexPage;
