import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle } from 'lucide-react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const AddBusComponent = () => {
  const [busDetails, setBusDetails] = useState({
    busNo: '', // Added busNo
    plateNumber: '',
    vin: '',
    capacity: '',
    busModel: '',
    manufactureYear: '',
    fuelType: ''
  });

  const [validations, setValidations] = useState({
    busNo: false, // Added validation for busNo
    plateNumber: false,
    vin: false,
    capacity: false,
    busModel: false,
    manufactureYear: false,
    fuelType: false
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'busNo': // Added validation for busNo
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
        if (!['Diesel', 'Electric', 'Hybrid','Petrol'].includes(value.toLowerCase())) {
          return 'Invalid fuel type. Please select from Petrol, Diesel, Electric, or Hybrid.';
      }      
      default:
        return false;
    }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusDetails((prev) => ({
      ...prev,
      [name]: value
    }));

    setValidations((prev) => ({
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

    const token = localStorage.getItem('token');
    if (!token) {
      alert('No authentication token found');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/add-bus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(busDetails)
      });

      const responseText = await response.text();

      if (response.status === 404) {
        alert('API endpoint not found. Please check the backend configuration.');
        return;
      }

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Failed to register bus');
        } catch (err) {
          throw new Error(responseText || 'An unexpected error occurred');
        }
      }

      const result = JSON.parse(responseText);
      alert('Bus registered successfully!');
      console.log('Response:', result);

      setBusDetails({
        busNo: '', // Reset busNo
        plateNumber: '',
        vin: '',
        capacity: '',
        busModel: '',
        manufactureYear: '',
        fuelType: ''
      });
    } catch (error) {
      console.error('Error:', error.message);
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-lg rounded-xl border-2 border-indigo-50">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-indigo-800 flex items-center">
          <AlertCircle className="mr-3 text-indigo-600" size={32} />
          Bus Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {[ 
            { name: 'busNo', placeholder: 'Bus Number', type: 'text' }, // Added Bus Number
            { name: 'plateNumber', placeholder: 'Plate Number (e.g., ABC-1234)', type: 'text' },
            { name: 'vin', placeholder: 'Vehicle Identification Number (VIN)', type: 'text' },
            { name: 'capacity', placeholder: 'Capacity', type: 'number' },
            { name: 'busModel', placeholder: 'Bus Model (e.g., Volvo B9R)', type: 'text' },
            { name: 'manufactureYear', placeholder: 'Manufacture Year (e.g., 2020)', type: 'number' },
            { name: 'fuelType', placeholder: 'Fuel Type (e.g., Diesel, Electric)', type: 'text' }
          ].map((field) => (
            <div key={field.name} className="relative">
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={busDetails[field.name]}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-md transition-all duration-300 
                  ${validations[field.name] ? 'border-green-500' : 'border-gray-300'}`}
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
            disabled={!Object.values(validations).every((valid) => valid)}
          >
            Register Bus
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddBusComponent;
