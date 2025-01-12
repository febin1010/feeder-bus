import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const AddDriverComponent = () => {
  const [driverDetails, setDriverDetails] = useState({
    driverNumber: '',  
    name: '',
    licenseNumber: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    username: '',
    password: ''
  });

  const [validations, setValidations] = useState({
    driverNumber: true,  
    name: true,
    licenseNumber: true,
    dateOfBirth: true,
    email: true,
    phone: true,
    username: true,
    password: true
  });

  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    if (!value) return true; // Empty fields are considered valid initially

    switch(name) {
      case 'driverNumber':
        return /^[A-Za-z0-9]{6,10}$/.test(value);
      case 'name':
        return value.length >= 2;
      case 'licenseNumber':
        const licenseRegex = /^[A-Z]{2}\d{13}$/;
        return licenseRegex.test(value);
      case 'dateOfBirth':
        return true; // No restrictions
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return /^[6-9]\d{9}$/.test(value);
      default:
        return true;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDriverDetails(prev => ({
      ...prev,
      [name]: value
    }));

    // Only validate personal details fields
    if (name !== 'username' && name !== 'password') {
      setValidations(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields before submission
    const personalDetailsValid = Object.entries(validations)
      .filter(([key]) => key !== 'username' && key !== 'password')
      .every(([, valid]) => valid);

    if (!personalDetailsValid) {
      alert('Please correct all personal details before submission');
      return;
    }

    const token = localStorage.getItem('token'); 
    if (!token) {
      alert('No authentication token found');
      return;
    }

    

    try {
      const response = await fetch(`${backendUrl}/api/admin/add-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(driverDetails),
      });

      const responseText = await response.text();

      if (response.status === 404) {
        alert('API endpoint not found. Please check the backend configuration.');
        return;
      }

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Failed to register driver');
        } catch (err) {
          throw new Error(responseText || 'An unexpected error occurred');
        }
      }

      const result = JSON.parse(responseText);
      alert('Driver registered successfully!');
      console.log('Response:', result);

      // Reset form after successful submission
      setDriverDetails({
        driverNumber: '',  
        name: '',
        licenseNumber: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        username: '',
        password: ''
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
          Driver Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-indigo-700">Personal Details</h3>
            {[
              { name: 'driverNumber', placeholder: 'Driver Number (6-10 characters)', type: 'text' },
              { name: 'name', placeholder: 'Full Name', type: 'text' },
              { name: 'licenseNumber', placeholder: 'License Number (15 digits)', type: 'text' },
              { name: 'dateOfBirth', placeholder: 'Date of Birth', type: 'date' },
              { name: 'email', placeholder: 'Email Address', type: 'email' },
              { name: 'phone', placeholder: 'Phone Number', type: 'tel' }
            ].map(field => (
              <div key={field.name} className="relative">
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={driverDetails[field.name]}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-md transition-all duration-300 
                    ${field.name === 'dateOfBirth' ? '' : 
                      (driverDetails[field.name] ? 
                        (validations[field.name] ? 'border-green-500' : 'border-red-500') 
                        : 'border-gray-300')}`}
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
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-indigo-700">Login Details</h3>
            <div className="relative">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={driverDetails.username}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-md"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={driverDetails.password}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-md pr-12"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
          >
            Register Driver
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddDriverComponent;