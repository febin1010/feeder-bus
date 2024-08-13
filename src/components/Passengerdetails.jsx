import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import kmrlLogo from '@/components/KMRL-logo.png'; // Adjust the import path as necessary

const PassengerDashboard = () => {
  const [passengers, setPassengers] = useState([]);
  const [departedPassengers, setDepartedPassengers] = useState([]);
  const [newPassenger, setNewPassenger] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTripStarted, setIsTripStarted] = useState(false);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Redirect to login if not logged in
      return;
    }

    const tripId = localStorage.getItem('tripId'); // Get tripId from localStorage
    if (tripId) {
      fetchPassengers(tripId, token);
      fetchDepartedPassengers(tripId, token);
      setIsTripStarted(false); 
    }
  }, [navigate]);

  const fetchPassengers = async (tripId, token) => {
    try {
      const response = await fetch(`${backendUrl}/api/passengers?tripId=${tripId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPassengers(data);
    } catch (error) {
      console.error('Error fetching passengers:', error);
    }
  };

  const fetchDepartedPassengers = async (tripId, token) => {
    try {
      const response = await fetch(`${backendUrl}/api/departed-passengers?tripId=${tripId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDepartedPassengers(data);
    } catch (error) {
      console.error('Error fetching departed passengers:', error);
    }
  };

  const handleAddPassenger = async () => {
    const tripId = localStorage.getItem('tripId'); // Get tripId from localStorage
  
    if (!tripId) {
      alert('Trip ID is missing. Please start the trip first.');
      return;
    }
  
    if (passengers.length >= 35) {
      alert('Cannot add more than 35 passengers.');
      return;
    }
  
    if (!newPassenger || !paymentMethod) {
      alert('Please enter the passenger name and select a payment method.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/add-passenger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newPassenger, paymentmode: paymentMethod, tripId }), // Include tripId
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
  
      const result = await response.json();
      console.log(result.message); // Handle the result from the server
  
      // Update local state
      setPassengers([...passengers, { id: result.id, name: newPassenger, paymentmode: paymentMethod }]);
      setNewPassenger('');
      setPaymentMethod('online');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding passenger:', error.message);
    }
  };
  
  const handleMarkAsDeparted = async (index) => {
    const passenger = passengers[index];
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/mark-departed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: passenger.id }),
      });

      if (response.ok) {
        setPassengers(passengers.filter((_, i) => i !== index));
        setDepartedPassengers([...departedPassengers, passenger]);
      } else {
        const errorText = await response.text();
        console.error('Failed to mark passenger as departed:', errorText);
      }
    } catch (error) {
      console.error('Error marking passenger as departed:', error.message);
    }
  };

  const handleTripStart = () => {
    setIsTripStarted(true);
  };

  const handleTripEnd = async () => {
    const tripId = localStorage.getItem('tripId'); // Get tripId from localStorage
  
    if (!tripId) {
      alert('Trip ID is missing.');
      return;
    }
  
    if (window.confirm('Are you sure you want to end the trip?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendUrl}/api/end-trip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ tripId }), // Include tripId
        });
  
        if (response.ok) {
          alert('Trip ended successfully');
          localStorage.removeItem('tripId'); // Clear the tripId from localStorage
          navigate('/driver-dashboard'); // Redirect to DriverDashboard
        } else {
          const errorText = await response.text();
          alert(`Failed to end trip: ${errorText}`);
        }
      } catch (error) {
        console.error('Error ending trip:', error.message);
        alert('An error occurred while ending the trip. Please try again.');
      }
    }
  };
  
  
  const handleLogout = async () => {
    if (isTripStarted) {
      if (window.confirm('Trip is not ended. Do you want to end the trip before logging out?')) {
        await handleTripEnd();
      }
    }

    if (!isTripStarted) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="relative flex-shrink-0">
              <img src={kmrlLogo} alt="KMRL Logo" className="h-24 w-24 object-contain" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }} />
            </div>
            <h1 className="ml-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Feeder Bus
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            Logout
          </button>
        </div>
        <div className="flex justify-center items-center mb-4 space-x-2">
          <button
            onClick={handleTripStart}
            className={`py-2 px-4 rounded-md text-white ${isTripStarted ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            disabled={isTripStarted}
          >
            Trip Start
          </button>
          <button
            onClick={handleTripEnd}
            className={`py-2 px-4 rounded-md text-white ${!isTripStarted ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
            disabled={!isTripStarted}
          >
            Trip End
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`ml-2 py-2 px-4 rounded-md text-white ${isTripStarted ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            disabled={isTripStarted}
          >
            Add Passenger
          </button>
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-2">Current Passengers</h2>
          <div className="overflow-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden table-fixed">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-2 border-b w-1/3">Name</th>
                  <th className="py-2 px-2 border-b w-1/3">Payment Method</th>
                  <th className="py-2 px-2 border-b w-1/3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((passenger, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-2 border-b text-center">{passenger.name}</td>
                    <td className="py-2 px-2 border-b text-center">{passenger.paymentmode}</td>
                    <td className="py-2 px-2 border-b text-center">
                      <button
                        onClick={() => handleMarkAsDeparted(index)}
                        className="py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        Departed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Departed Passengers</h2>
          <div className="overflow-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden table-fixed">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-2 border-b w-1/2">Name</th>
                  <th className="py-2 px-2 border-b w-1/2">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {departedPassengers.map((passenger, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-2 border-b text-center">{passenger.name}</td>
                    <td className="py-2 px-2 border-b text-center">{passenger.paymentmode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-medium mb-2">Add Passenger</h2>
            <input
              type="text"
              value={newPassenger}
              onChange={(e) => setNewPassenger(e.target.value)}
              placeholder="Passenger Name"
              className="mb-2 w-full py-2 px-3 border rounded-md"
            />
            <div className="mb-2">
              <label className="block font-medium mb-1">Payment Mode</label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">Online</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input
                  type="radio"
                  value="offline"
                  checked={paymentMethod === 'offline'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">Offline</span>
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPassenger}
                className="py-2 px-4 bg-blue-600 text-white rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDashboard;
