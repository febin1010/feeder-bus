import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
  const [time, setTime] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulate data submission
    alert(`Time: ${time}`);
    navigate('/passenger-dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <div className="text-2xl font-semibold mb-4 text-center">Driver Dashboard</div>
        <h1 className="text-xl font-medium mb-6 text-center">Welcome, Driver Name</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="options" className="text-sm font-medium mb-2">Trip:</label>
            <select id="options" className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <option value="option1">Aluva to CIAL</option>
              <option value="option2">CIAL to Aluva</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="time" className="text-sm font-medium mb-2">Time:</label>
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
