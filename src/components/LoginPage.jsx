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

export function LoginForm() {
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

      const response = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.text(); // Use text() to get non-JSON response
        throw new Error(errorData || 'Login failed');
      }

      const data = await response.json();

      localStorage.setItem('token', data.token);
      alert('Login successful');
      navigate('/driver-dashboard'); // Redirect on successful login
    } catch (error) {
      console.error('An error occurred while logging in:', error);
      setError(error.message || 'An error occurred while logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-6 bg-white shadow-md rounded-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-semibold">Login</CardTitle>
          <CardDescription className="text-sm sm:text-base md:text-lg">
            Enter your name below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleLogin}>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm sm:text-base md:text-lg">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:px-4 sm:py-3 md:px-5 md:py-4"
              />
            </div>
            <div className="grid gap-2 mb-4"> {/* Added margin-bottom for spacing */}
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
