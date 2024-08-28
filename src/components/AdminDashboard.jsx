import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"; 

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { BarChart as RechartsBarChart, LineChart as RechartsLineChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    navigate('/admin-login', { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Card className="w-full max-w-2xl p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold">
                Welcome to the Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <p className="text-base sm:text-lg text-gray-700">
                Here’s an overview of your system performance.
              </p>
              <div className="w-full h-64 mb-8">
                <RechartsBarChart
                  width={600}
                  height={300}
                  data={[{ name: 'Drivers', value: 30 }, { name: 'Buses', value: 45 }, { name: 'Routes', value: 20 }]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </RechartsBarChart>
              </div>
              <div className="w-full h-64">
                <RechartsLineChart
                  width={600}
                  height={300}
                  data={[
                    { name: 'January', value: 200 },
                    { name: 'February', value: 300 },
                    { name: 'March', value: 250 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </RechartsLineChart>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full py-2 sm:py-3 md:py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Explore More
              </Button>
            </CardFooter>
          </Card>
        );
      case 'drivers':
        return (
          <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold">Add Driver</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <input
                type="text"
                placeholder="Enter driver name"
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
              />
              <Button className="w-full py-2 sm:py-3 md:py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Add Driver
              </Button>
            </CardContent>
          </Card>
        );
      case 'edit-driver':
        return (
          <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold">Edit Driver</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <input
                type="text"
                placeholder="Enter driver name to edit"
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
              />
              <Button className="w-full py-2 sm:py-3 md:py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Edit Driver
              </Button>
            </CardContent>
          </Card>
        );
      case 'delete-driver':
        return (
          <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold">Delete Driver</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <input
                type="text"
                placeholder="Enter driver name to delete"
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
              />
              <Button className="w-full py-2 sm:py-3 md:py-4 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete Driver
              </Button>
            </CardContent>
          </Card>
        );
      case 'buses':
        return (
          <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold">Bus Management</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button className="w-full py-2 sm:py-3 md:py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Manage Buses
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setActiveTab('add-bus')}>Add Bus</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('modify-bus')}>Modify Bus</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('delete-bus')}>Delete Bus</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {activeTab === 'add-bus' && (
                <div className="space-y-4 mt-4">
                  <input
                    type="text"
                    placeholder="Enter bus number"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Enter route"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                  />
                  <Button className="w-full py-2 sm:py-3 md:py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Add Bus
                  </Button>
                </div>
              )}
              {activeTab === 'modify-bus' && (
                <div className="space-y-4 mt-4">
                  <input
                    type="text"
                    placeholder="Enter bus number to modify"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Enter new route"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                  />
                  <Button className="w-full py-2 sm:py-3 md:py-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                    Modify Bus
                  </Button>
                </div>
              )}
              {activeTab === 'delete-bus' && (
                <div className="space-y-4 mt-4">
                  <input
                    type="text"
                    placeholder="Enter bus number to delete"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                  />
                  <Button className="w-full py-2 sm:py-3 md:py-4 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Delete Bus
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'search':
        return (
          <Card className="w-full max-w-xl p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold">Search Drivers</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <input
                type="text"
                placeholder="Search for drivers"
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Route</th>
                      <th className="py-2 px-4 border-b">Timing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border-b">John Doe</td>
                      <td className="py-2 px-4 border-b">Route A</td>
                      <td className="py-2 px-4 border-b">10:00 AM - 6:00 PM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-white shadow-md rounded-lg mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <nav className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button variant="ghost" className="text-gray-900" onClick={() => setActiveTab('home')}>Home</Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="text-gray-900">Drivers</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTab('drivers')}>Add Driver</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('edit-driver')}>Edit Driver</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('delete-driver')}>Delete Driver</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="text-gray-900">Buses</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTab('buses')}>Manage Buses</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" className="text-gray-900" onClick={() => setActiveTab('search')}>Search Drivers</Button>
        </nav>
        <Button variant="ghost" className="text-red-600 mt-4 sm:mt-0" onClick={handleLogout}>Logout</Button>
      </header>
      <main className="flex-grow">
        {renderContent()}
      </main>
    </div>
  );
}
