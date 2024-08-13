import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import kmrlLogo from '@/components/KMRL-logo.png'; // Adjust the import path as necessary

const DriverDashboard = () => {
  const [time, setTime] = useState('');
  const [trip, setTrip] = useState('Aluva to CIAL');
  const [driverName, setDriverName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [busNumbers, setBusNumbers] = useState([]);
  const [filteredBusNumbers, setFilteredBusNumbers] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('driverName');
    if (!token) {
      navigate('/'); // Redirect to login if not logged in
    } else {
      setDriverName(name); // Set the driver's name
      fetchBusNumbers(token); // Fetch bus numbers after ensuring the token is present
    }
  }, [navigate]);

  const fetchBusNumbers = async (token) => {
    try {
      const response = await fetch(`${backendUrl}/api/bus-numbers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBusNumbers(data); // Set the bus numbers
      } else {
        console.error('Failed to fetch bus numbers');
      }
    } catch (error) {
      console.error('Error fetching bus numbers:', error);
    }
  };

  const handleBusNumberChange = (e) => {
    const input = e.target.value.trim();
    setBusNumber(input);
  
    if (input === '') {
      setFilteredBusNumbers([]); // Clear the filtered options if input is empty
      setIsDropdownVisible(false); // Hide the dropdown
      return;
    }
  
    const filteredOptions = busNumbers.filter((bus) =>
      bus.bus_no.toString().includes(input)
    );
  
    if (filteredOptions.length === 0 && input) {
      setFilteredBusNumbers([{ id: 'invalid', bus_no: 'Invalid Bus Number' }]);
    } else {
      setFilteredBusNumbers(filteredOptions);
    }
  
    setIsDropdownVisible(true); // Show the dropdown
  };
  
  const handleDropdownSelect = (selectedBusNumber) => {
    if (selectedBusNumber !== 'Invalid Bus Number') {
      setBusNumber(selectedBusNumber);
      setIsDropdownVisible(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    console.log('Submitting with Token:', token);

    try {
      const response = await fetch(`${backendUrl}/api/start-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trip, time, busNumber }), // Include busNumber in the request body
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
      const response = await fetch(`${backendUrl}/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
          <div className="relative flex flex-col">
            <label htmlFor="bus-number" className="text-sm font-medium mb-2 text-gray-700">Bus Number:</label>
            <input
              id="bus-number"
              type="text"
              value={busNumber}
              onChange={handleBusNumberChange}
              onFocus={() => setIsDropdownVisible(true)}
              onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Type to search bus number"
              required
            />
            {isDropdownVisible && (
              <div className="absolute top-full mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white z-10 w-full">
                {filteredBusNumbers.map((bus) => (
                  <div
                    key={bus.id}
                    onClick={() => bus.bus_no !== 'Invalid Bus Number' && handleDropdownSelect(bus.bus_no)}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${bus.bus_no === 'Invalid Bus Number' ? 'text-red-600' : ''}`}
                  >
                    {bus.bus_no}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="time" className="text-sm font-medium mb-2 text-gray-700">Time:</label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>
          <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
            Start Trip
          </button>
        </form>
      </div>

      {/* Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="current-password" className="text-sm font-medium mb-2 text-gray-700">Current Password:</label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="new-password" className="text-sm font-medium mb-2 text-gray-700">New Password:</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="confirm-password" className="text-sm font-medium mb-2 text-gray-700">Confirm New Password:</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
                {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600">
                  Cancel
                </button>
                <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
