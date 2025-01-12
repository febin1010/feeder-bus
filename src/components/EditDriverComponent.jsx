import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, AlertCircle } from 'lucide-react';
import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;


const EditDriverComponent = ({ initialDriverData }) => {
  const [driverDetails, setDriverDetails] = useState({
    driverNumber: '',  
    name: '',
    licenseNumber: '',
    dateOfBirth: '',
    email: '',
    phone: ''
  });

  const [validations, setValidations] = useState({
    driverNumber: false,  
    name: true,
    licenseNumber: true,
    dateOfBirth: true,
    email: true,
    phone: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDriverFound, setIsDriverFound] = useState(false);

  const token = localStorage.getItem('token'); 
  if (!token) {
    alert('No authentication token found');
    return;
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch driver details from API
const fetchDriverDetails = async (driverNumber) => {
  setLoading(true);
  setError('');
  try {
    const response = await axios.get(`${backendUrl}/api/admin/drivers/${driverNumber}`, config);
    if (response.data) {
      setDriverDetails({
        ...response.data,
        dateOfBirth: response.data.dateOfBirth
          ? new Date(response.data.dateOfBirth).toISOString().split('T')[0]
          : '', // Format date for input field
      });
      setIsDriverFound(true);
    } else {
      setError('Driver not found');
      setIsDriverFound(false);
    }
  } catch (err) {
    setError('Failed to fetch data');
    setIsDriverFound(false);
  } finally {
    setLoading(false);
  }
};

  const handleDriverNumberChange = (e) => {
    const { value } = e.target;
    setDriverDetails(prev => ({
      ...prev,
      driverNumber: value
    }));
    setValidations(prev => ({
      ...prev,
      driverNumber: value.length >= 6 && value.length <= 10  // Basic validation for driver number length
    }));
    if (value.length >= 6 && value.length <= 10) {
      fetchDriverDetails(value);
    } else {
      setIsDriverFound(false);
      setError('');
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length > 0;
      case 'licenseNumber':
        return /^[A-Za-z]{2}\d{13}$/.test(value);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return /^\d{10}$/.test(value);
      default:
        return true;
    }
  };
  

  // Handle submit and update driver details
const handleSubmit = async (e) => {
  e.preventDefault();
  const allFieldsValid = Object.entries(validations)
    .filter(([key]) => key !== 'dateOfBirth')
    .every(([, valid]) => valid);

  if (allFieldsValid) {
    try {
      setLoading(true);
      const payload = {
        ...driverDetails,
        dateOfBirth: driverDetails.dateOfBirth || null, 
      };
      await axios.put(
        `${backendUrl}/api/admin/update-driver/${driverDetails.driverNumber}`,
        payload,
        config
      );
      alert('Driver updated successfully');
    } catch (err) {
      console.error('Failed to update driver:', err);
      alert('Failed to update driver');
    } finally {
      setLoading(false);
    }
  } else {
    alert('Please correct all fields before submission');
  }
};

  useEffect(() => {
    if (initialDriverData) {
      setDriverDetails(initialDriverData);
      setIsDriverFound(true);
    }
  }, [initialDriverData]);

  return (
    <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-lg rounded-xl border-2 border-indigo-50">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-indigo-800 flex items-center">
          <Edit className="mr-3 text-indigo-600" size={32} />
          Edit Driver Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="relative">
            <input
              type="text"
              name="driverNumber"
              placeholder="Driver Number (6-10 characters)"
              value={driverDetails.driverNumber}
              onChange={handleDriverNumberChange}
              className={`w-full p-3 border rounded-md transition-all duration-300 
                ${validations.driverNumber ? 'border-green-500' : 'border-gray-300'}`}
            />
            {driverDetails.driverNumber && !validations.driverNumber && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={24} />
            )}
          </div>

          <Button
            type="button"
            onClick={() => fetchDriverDetails(driverDetails.driverNumber)}
            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
            disabled={!validations.driverNumber || isDriverFound}
          >
            Populate Driver Details
          </Button>

          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {[{
            name: 'name',
            placeholder: 'Full Name',
            type: 'text'
          }, {
            name: 'licenseNumber',
            placeholder: 'License Number (15 digits)',
            type: 'text'
          }, {
            name: 'dateOfBirth',
            placeholder: 'Date of Birth',
            type: 'date'
          }, {
            name: 'email',
            placeholder: 'Email Address',
            type: 'email'
          }, {
            name: 'phone',
            placeholder: 'Phone Number',
            type: 'tel'
          }].map(field => (
            <div key={field.name} className="relative">
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={driverDetails[field.name] || ''}
                onChange={(e) => {
                  const { name, value } = e.target;
                  setDriverDetails(prev => ({ ...prev, [name]: value }));
                  const isFieldValid = validateField(name, value);
                  console.log(`${name} validation result:`, isFieldValid); // Debugging output
                  setValidations(prev => ({
                    ...prev,
                    [name]: isFieldValid
                  }));
                }}                
                className={`w-full p-3 border rounded-md transition-all duration-300 
                  ${validations[field.name] ? 'border-green-500' : 'border-gray-300'}`}
                disabled={!isDriverFound}
              />
              {field.name !== 'dateOfBirth' && driverDetails[field.name] && (
                validations[field.name] ? (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={24} />
                ) : (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={24} />
                )
              )}
            </div>
          ))}

      <Button
        type="submit"
        className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
        disabled={
          !isDriverFound || 
          !Object.entries(validations)
            .filter(([key]) => key !== 'dateOfBirth')
            .every(([, valid]) => valid)
        }
      >
        Update Driver
      </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditDriverComponent;
