import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import kmrlLogo from '@/components/KMRL-logo.png'; // Adjust the import path as necessary

const DriverDashboard = () => {
  const [time, setTime] = useState('');
  const [trip, setTrip] = useState('Aluva to CIAL');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the driver is logged in by checking the token in local storage
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Redirect to login if not logged in
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    console.log('Submitting with Token:', token); // Log the token
  
    try {
      const response = await fetch('/api/submit-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, trip, time }),
      });
  
      if (response.ok) {
        alert('Trip details submitted');
        navigate('/passenger-dashboard');
      } else {
        const data = await response.json();
        alert(`Failed to submit trip details: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting trip details');
    }
  };
  

  const handleLogout = () => {
    // Clear authentication token
    localStorage.removeItem('token');
    // Navigate back to the login page
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="flex items-center mb-8">
        <div className="relative flex-shrink-0">
          <img src={kmrlLogo} alt="KMRL Logo" className="h-24 w-24 object-contain" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }} />
        </div>
        <h1 className="ml-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white">
          Feeder Bus
        </h1>
      </div>
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            Logout
          </button>
        </div>
        <h1 className="text-xl font-medium mb-6 text-center text-gray-700">Welcome, Driver Name</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="options" className="text-sm font-medium mb-2 text-gray-700">Trip:</label>
            <select id="options" value={trip} onChange={(e) => setTrip(e.target.value)} className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <option value="Aluva to CIAL">Aluva to CIAL</option>
              <option value="CIAL to Aluva">CIAL to Aluva</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="time" className="text-sm font-medium mb-2 text-gray-700">Time:</label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriverDashboard;
