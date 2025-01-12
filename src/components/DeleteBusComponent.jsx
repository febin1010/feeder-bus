import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, Check } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // Import toast and Toaster
const backendUrl = import.meta.env.VITE_BACKEND_URL;


const DeleteBusComponent = () => {
  const [busDetails, setBusDetails] = useState({
    busNo: '',
    plateNumber: '',
    vin: '',
    capacity: '',
    busModel: '',
    manufactureYear: '',
    fuelType: ''
  });

  const [validations, setValidations] = useState({
    busNo: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBusFound, setIsBusFound] = useState(false);

  const token = localStorage.getItem('token');
  if (!token) {
    alert('No authentication token found');
    return;
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchBusDetails = async (busNo) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${backendUrl}/api/admin/buses/${busNo}`, config);
      if (response.data) {
        setBusDetails(response.data);
        setIsBusFound(true);
        setValidations({
          busNo: true,
        });
      } else {
        setError('Bus not found');
        setIsBusFound(false);
      }
    } catch (err) {
      setError('Failed to fetch data');
      setIsBusFound(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBusNoChange = (e) => {
    const { value } = e.target;
    setBusDetails(prev => ({
      ...prev,
      busNo: value
    }));
    setValidations(prev => ({
      ...prev,
      busNo: value.trim().length > 0
    }));
    if (value.trim().length > 0) {
      fetchBusDetails(value);
    } else {
      setIsBusFound(false);
      setError('');
    }
  };

  const handleDeleteBus = async () => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
  
    setLoading(true);  // Disable button
    try {
      const deleteUrl = `${backendUrl}/api/admin/delete-bus/${busDetails.busNo}`;
      console.log('Sending DELETE request to:', deleteUrl);
  
      const response = await axios.delete(deleteUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log('Delete response:', response.data);
      if (response.status === 200) {
        alert('Bus deleted successfully');
        // Reset bus details and state
        setBusDetails({
          busNo: '',
          plateNumber: '',
          vin: '',
          capacity: '',
          busModel: '',
          manufactureYear: '',
          fuelType: ''
        });
        setIsBusFound(false);
      }
    } catch (err) {
      console.error('Failed to delete bus:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to delete bus. Please try again.');
    } finally {
      setLoading(false);  // Re-enable button after the request completes
    }
  };
  

  return (
    <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-lg rounded-xl border-2 border-indigo-50">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-indigo-800 flex items-center">
          <Trash2 className="mr-3 text-red-600" size={32} />
          Delete Bus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="relative">
            <input
              type="text"
              name="busNo"
              placeholder="Bus Number"
              value={busDetails.busNo}
              onChange={handleBusNoChange}
              className={`w-full p-3 border rounded-md transition-all duration-300 
                ${validations.busNo ? 'border-green-500' : 'border-gray-300'}`}
            />
            {busDetails.busNo && !validations.busNo && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={24} />
            )}
          </div>

          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {isBusFound && (
            <>
              <div className="grid gap-4">
                <div>
                  <strong>Plate Number:</strong> {busDetails.plateNumber}
                </div>
                <div>
                  <strong>VIN:</strong> {busDetails.vin}
                </div>
                <div>
                  <strong>Capacity:</strong> {busDetails.capacity}
                </div>
                <div>
                  <strong>Bus Model:</strong> {busDetails.busModel}
                </div>
                <div>
                  <strong>Manufacture Year:</strong> {busDetails.manufactureYear}
                </div>
                <div>
                  <strong>Fuel Type:</strong> {busDetails.fuelType}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleDeleteBus}
                className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
                disabled={loading}
              >
                Delete Bus
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default DeleteBusComponent;
