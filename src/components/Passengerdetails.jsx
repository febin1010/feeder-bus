import React, { useState } from 'react';

const PassengerDashboard = () => {
  const [passengers, setPassengers] = useState([]);
  const [departedPassengers, setDepartedPassengers] = useState([]);
  const [newPassenger, setNewPassenger] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTripStarted, setIsTripStarted] = useState(false);

  const handleAddPassenger = () => {
    if (passengers.length >= 35) {
      alert('Cannot add more than 35 passengers.');
      return;
    }
    setPassengers([...passengers, { name: newPassenger, paymentMethod }]);
    setNewPassenger('');
    setPaymentMethod('online');
    setIsModalOpen(false);
  };

  const handleMarkAsDeparted = (index) => {
    const passenger = passengers[index];
    setPassengers(passengers.filter((_, i) => i !== index));
    setDepartedPassengers([...departedPassengers, passenger]);
  };

  const handleTripStart = () => {
    setIsTripStarted(true);
  };

  const handleTripEnd = () => {
    if (window.confirm('Are you sure you want to end the trip?')) {
      setIsTripStarted(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-lg">
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
                  <th className="py-2 px-2 border-b w-1/3">Action</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((passenger, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-2 border-b break-words">{passenger.name}</td>
                    <td className="py-2 px-2 border-b">{passenger.paymentMethod}</td>
                    <td className="py-2 px-2 border-b">
                      <button
                        onClick={() => handleMarkAsDeparted(index)}
                        className="py-1 px-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
        <div className="mt-6">
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
                    <td className="py-2 px-2 border-b break-words">{passenger.name}</td>
                    <td className="py-2 px-2 border-b">{passenger.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Add Passenger</h2>
            <input
              type="text"
              value={newPassenger}
              onChange={(e) => setNewPassenger(e.target.value)}
              placeholder="Enter passenger name"
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <div className="mb-2">
              <h3 className="text-md font-medium text-gray-700 mb-2">Payment Mode</h3>
              <label className="block mb-1">
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Online Payment
              </label>
              <label className="block">
                <input
                  type="radio"
                  value="offline"
                  checked={paymentMethod === 'offline'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Offline Payment
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPassenger}
                className="py-2 px-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
