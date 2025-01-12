import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, Check } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // Import toast and Toaster
const backendUrl = import.meta.env.VITE_BACKEND_URL;


const DeleteDriverComponent = () => {
  const [driverNumber, setDriverNumber] = useState('');
  const [driverDetails, setDriverDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  const token = localStorage.getItem('token'); 
  if (!token) {
    alert('No authentication token found');
    return;
  }

  const validateDriverNumber = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${backendUrl}/api/admin/drivers/${driverNumber}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      setDriverDetails(response.data);
      setIsValid(true);
    } catch (err) {
      setDriverDetails(null);
      setIsValid(false);
      setError('Invalid driver number or driver not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!driverDetails) {
      setError('No driver details available for deletion.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the driver: ${driverDetails.name}?`
    );

    if (confirmDelete) {
      try {
        setLoading(true);
  
        const response = await axios.delete(`${backendUrl}/api/admin/delete-driver/${driverNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          toast.success(response.data.message || 'Driver deleted successfully.');
          setDriverDetails(null);
          setDriverNumber('');
          setIsValid(false);
        } else {
          toast.error('Unexpected response from the server.');
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Driver not found. It may have already been deleted.');
        } else if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please log in again.');
        } else {
          setError('Failed to delete driver. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-lg rounded-xl border-2 border-red-50">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-red-800 flex items-center">
          <Trash2 className="mr-3 text-red-600" size={32} />
          Delete Driver
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="relative">
            <input
              type="text"
              name="driverNumber"
              placeholder="Enter Driver Number"
              value={driverNumber}
              onChange={(e) => {
                setDriverNumber(e.target.value);
                setIsValid(false);
                setDriverDetails(null);
              }}
              className={`w-full p-3 border rounded-md transition-all duration-300 
                ${isValid ? 'border-green-500' : 'border-gray-300'}`}
            />
            {isValid && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={24} />
            )}
          </div>

          <Button
            type="button"
            onClick={validateDriverNumber}
            className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
            disabled={!driverNumber || loading}
          >
            {loading ? 'Validating...' : 'Validate Driver Number'}
          </Button>

          {error && <div className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle className="mr-2" /> {error}</div>}

          {driverDetails && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Driver Details</h3>
              <p><strong>Name:</strong> {driverDetails.name}</p>
              <p><strong>Contact:</strong> {driverDetails.phone}</p>
              <p><strong>License Number:</strong> {driverDetails.licenseNumber}</p>
              <p><strong>Assigned Bus:</strong> {driverDetails.assignedBus}</p>
              <p><strong>Route:</strong> {driverDetails.route}</p>
            </div>
          )}

          {driverDetails && (
            <Button
              type="button"
              onClick={handleDelete}
              variant="destructive"
              className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300 flex items-center justify-center"
            >
              <Trash2 className="mr-2" size={20} /> Delete Driver
            </Button>
          )}
        </div>
      </CardContent>

      {/* Toaster container for displaying notifications */}
      <Toaster />
    </Card>
  );
};

export default DeleteDriverComponent;
