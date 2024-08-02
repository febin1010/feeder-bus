import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import kmrlLogo from '@/components/KMRL-logo.png'; // Adjust the import path as necessary

const DriverDashboard = () => {
  const [time, setTime] = useState('');
  const [trip, setTrip] = useState('Aluva to CIAL');
  const [driverName, setDriverName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('driverName');
    if (!token) {
      navigate('/'); // Redirect to login if not logged in
    } else {
      setDriverName(name); // Set the driver's name
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    console.log('Submitting with Token:', token);

    try {
      const response = await fetch('http://localhost:5000/api/start-trip', { // Adjust the backend URL if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify({ trip, time }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('tripId', data.tripId); // Save tripId to localStorage
        alert('Trip started');
        navigate('/passenger-dashboard');
      } else {
        const errorText = await response.text();
        console.error('Failed to start trip:', errorText);
        alert(`Failed to start trip: ${errorText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error starting trip');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('driverName'); // Clear the driver's name
    navigate('/');
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/change-password', { // Adjust the backend URL if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        alert('Password changed successfully');
        setIsModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
      } else {
        const data = await response.json();
        alert(`Failed to change password: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error changing password');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="absolute top-4 right-4 flex flex-col items-center space-y-2">
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          Logout
        </button>
        <a
          href="#"
          onClick={() => setIsModalOpen(true)}
          className="text-yellow-500 hover:underline"
        >
          Change Password
        </a>
      </div>
      <div className="flex items-center mb-8">
        <div className="relative flex-shrink-0">
          <img src={kmrlLogo} alt="KMRL Logo" className="h-24 w-24 object-contain" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }} />
        </div>
        <h1 className="ml-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white">
          Feeder Bus
        </h1>
      </div>
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-xl font-medium text-gray-700">Welcome, {driverName}</h1>
        </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="current-password" className="text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="new-password" className="text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="confirm-password" className="text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600">
                Change Password
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-2 mt-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
