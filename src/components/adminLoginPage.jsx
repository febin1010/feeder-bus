import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import kmrlLogo from '@/components/KMRL-logo.png'; // Adjust the import path as necessary

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  console.log("Backend URL:", backendUrl); // Log the URL

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!backendUrl) {
        throw new Error('Backend URL is not defined');
      }

      const response = await fetch(`${backendUrl}/api/admin/login`, { // Updated endpoint for admin login
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Login failed');
      }

      const data = await response.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('adminName', email); // Store the admin's name
      alert('Login successful');
      navigate('/admin-dashboard'); // Redirect to admin dashboard
    } catch (error) {
      console.error('An error occurred while logging in:', error);
      setError(error.message || 'An error occurred while logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="flex items-center mb-8">
        <div className="relative flex-shrink-0">
          <img src={kmrlLogo} alt="KMRL Logo" className="h-24 w-24 object-contain" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }} />
        </div>
        <h1 className="ml-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white">
          Feeder Bus
        </h1>
      </div>
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-6 bg-white shadow-md rounded-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-semibold">Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleLogin}>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm sm:text-base md:text-lg">Username</Label>
              <Input
                id="email"
                type="text"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:px-4 sm:py-3 md:px-5 md:py-4"
              />
            </div>
            <div className="grid gap-2 mb-4 mt-4"> {/* Added margin-bottom and margin-top for spacing */}
              <Label htmlFor="password" className="text-sm sm:text-base md:text-lg">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:px-4 sm:py-3 md:px-5 md:py-4"
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <CardFooter>
              <Button
                type="submit"
                className="w-full py-2 sm:py-3 md:py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
