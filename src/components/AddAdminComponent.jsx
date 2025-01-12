import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertCircle, 
  CheckCircle2, 
  UserPlus 
} from 'lucide-react';
const backendUrl = import.meta.env.VITE_BACKEND_URL;


export function AddAdminComponent() {
  const [username, setUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Validation (could be extended)
    if (!username || !adminPassword) {
      setErrorMessage('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Create admin logic (Replace with your actual API call)
    try {
      const response = await fetch(`${backendUrl}/api/admin/add-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          username,
          password: adminPassword,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Admin created successfully!');
        // Optionally, clear the form or take further actions
        setUsername('');
        setAdminPassword('');
      } else {
        const data = await response.json();
        setErrorMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setErrorMessage('An error occurred while creating the admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 120,
        }}
        className="w-full max-w-md px-4"
      >
        <Card className="shadow-2xl border-none bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center py-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center space-x-2 mb-2"
            >
              <UserPlus className="w-10 h-10 text-purple-600" />
              <CardTitle className="text-3xl font-bold text-blue-800">
                Create Admin
              </CardTitle>
            </motion.div>
            <CardDescription className="text-gray-600">
              Set up a new administrator account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center bg-green-100 border border-green-300 text-green-800 p-3 rounded-md mb-4"
              >
                <CheckCircle2 className="mr-2 w-5 h-5 text-green-600" />
                <span>{successMessage}</span>
              </motion.div>
            )}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center bg-red-100 border border-red-300 text-red-800 p-3 rounded-md mb-4"
              >
                <AlertCircle className="mr-2 w-5 h-5 text-red-600" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium text-blue-800 mb-2"
                >
                  Username
                </label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    className="w-full border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200"
                  />
                </motion.div>
              </div>
              <div>
                <label 
                  htmlFor="adminPassword" 
                  className="block text-sm font-medium text-blue-800 mb-2"
                >
                  Password
                </label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    type="password"
                    id="adminPassword"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200"
                  />
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Admin'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default AddAdminComponent;