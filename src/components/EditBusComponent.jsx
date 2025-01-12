import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Edit , AlertCircle } from 'lucide-react';
import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;


const EditBusComponent = ({ initialBusData }) => {
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
    plateNumber: false,
    vin: false,
    capacity: false,
    busModel: false,
    manufactureYear: false,
    fuelType: false
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
        // Set validations to true for all fields after fetching data
        setValidations({
          busNo: true,
          plateNumber: validateField('plateNumber', response.data.plateNumber),
          vin: validateField('vin', response.data.vin),
          capacity: validateField('capacity', response.data.capacity),
          busModel: validateField('busModel', response.data.busModel),
          manufactureYear: validateField('manufactureYear', response.data.manufactureYear),
          fuelType: validateField('fuelType', response.data.fuelType) // Ensure fuelType validation is set
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

  const validateField = (name, value) => {
    switch (name) {
      case 'busNo':
        return value.trim().length > 0;
      case 'plateNumber':
        const plateRegex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
        return plateRegex.test(value); // Indian vehicle plate number validation
      case 'vin':
        return value.length === 17;
      case 'capacity':
        return /^\d+$/.test(value) && Number(value) > 0;
      case 'busModel':
        return value.trim().length > 0;
      case 'manufactureYear':
        const year = parseInt(value, 10);
        const currentYear = new Date().getFullYear();
        return year >= 1990 && year <= currentYear;
      case 'fuelType':
        // Convert the input value to lowercase for case-insensitive comparison
        return ['diesel', 'electric', 'hybrid', 'petrol'].includes(value.trim().toLowerCase());
      default:
        return true;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusDetails(prev => ({
      ...prev,
      [name]: value
    }));
    setValidations(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFieldsValid = Object.values(validations).every((valid) => valid);

    if (!allFieldsValid) {
      alert('Please correct all fields before submission');
      return;
    }

    try {
      setLoading(true);
      const payload = { ...busDetails };
      await axios.put(`${backendUrl}/api/admin/update-bus/${busDetails.busNo}`, payload, config);
      alert('Bus updated successfully');
    } catch (err) {
      console.error('Failed to update bus:', err);
      alert('Failed to update bus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBusData) {
      setBusDetails(initialBusData);
      setIsBusFound(true);
    }
  }, [initialBusData]);

  return (
    <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-lg rounded-xl border-2 border-indigo-50">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-indigo-800 flex items-center">
          <Edit className="mr-3 text-indigo-600" size={32} />
          Edit Bus Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
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

          <Button
            type="button"
            onClick={() => fetchBusDetails(busDetails.busNo)}
            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
            disabled={!validations.busNo || isBusFound || loading}
          >
            Populate Bus Details
          </Button>

          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {[{
            name: 'plateNumber',
            placeholder: 'Plate Number (e.g., ABC-1234)',
            type: 'text'
          }, {
            name: 'vin',
            placeholder: 'Vehicle Identification Number (VIN)',
            type: 'text'
          }, {
            name: 'capacity',
            placeholder: 'Capacity',
            type: 'number'
          }, {
            name: 'busModel',
            placeholder: 'Bus Model (e.g., Volvo B9R)',
            type: 'text'
          }, {
            name: 'manufactureYear',
            placeholder: 'Manufacture Year (e.g., 2020)',
            type: 'number'
          }, {
            name: 'fuelType',
            placeholder: 'Fuel Type (Diesel, Electric, Hybrid, Petrol)',
            type: 'text'
          }].map(field => (
            <div key={field.name} className="relative">
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={busDetails[field.name] || ''}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-md transition-all duration-300 
                  ${validations[field.name] ? 'border-green-500' : 'border-gray-300'}`}
                disabled={!isBusFound || loading}
              />
              {busDetails[field.name] && (
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
            disabled={loading || !isBusFound || !Object.entries(validations).every(([, valid]) => valid)}
          >
            Update Bus
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditBusComponent;
