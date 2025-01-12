import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { UserCircle } from 'lucide-react'; 
import { FaUserCircle } from 'react-icons/fa'; // Profile icon from react-icons
const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
import AddDriverComponent from './AddDriverComponent'; 
import EditDriverComponent from './EditDriverComponent'; 
import AddBusComponent from './AddBusComponent';
import EditBusComponent from './EditBusComponent';
import DeleteDriverComponent from './DeleteDriverComponent';
import DeleteBusComponent from './DeleteBusComponent';
import AddRouteComponent from './AddRouteComponent';
import AssignDriverComponent from './AssignDriverComponent';
import SearchComponent from './SearchComponent';
import AddAdminComponent from './AddAdminComponent';
import { AdminDashboardHome } from './AdminDashboardHome';


export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [chartData, setChartData] = useState({
    barChartData: [],
    lineChartData: []
  });
  const [visitorChartData, setVisitorChartData] = useState([]);  // Added state for visitorChartData
  const [passengerData, setPassengerData] = useState([]); // New state for passenger data
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login', { replace: true });
    }

    // Fetch dynamic data for charts
    fetchChartData();
  }, [navigate]);



  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token is missing');
  
      const response = await fetch(`${backendUrl}/api/admin/get-dashboard-data`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Unauthorized access');
  
      const data = await response.json();
      setChartData({
        barChartData: [
          { name: 'Buses', value: data.counts.buses },
          { name: 'Drivers', value: data.counts.drivers },
          { name: 'Routes', value: data.counts.routes },
        ],
        lineChartData: data.monthlyStats || [],
      });
  
      setVisitorChartData(data.visitorChartData || []);
  
      if (data.passengerPieChartData && Array.isArray(data.passengerPieChartData)) {
        const totalPassengers = data.passengerPieChartData.reduce((acc, item) => acc + item.count, 0);
        setPassengerData(
          data.passengerPieChartData.map(item => ({
            month: new Date(0, item.month - 1).toLocaleString('default', { month: 'long' }),
            passengers: item.count,
            percentage: Math.round((item.count / totalPassengers) * 100),
          }))
        );
      } else {
        setPassengerData([]);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    navigate('/admin-login', { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <AdminDashboardHome chartData={chartData} visitorChartData={visitorChartData} passengerData={passengerData}/>;  // Pass visitorChartData
      case 'Search':
        return <SearchComponent />; 
      case 'drivers':
        return <AddDriverComponent />; 
      case 'edit-driver':
        return <EditDriverComponent />; 
      case 'delete-driver':
        return <DeleteDriverComponent />; 
      case 'buses':
        return <AddBusComponent />; 
      case 'edit-bus':
        return <EditBusComponent />; 
      case 'delete-bus':
        return <DeleteBusComponent />; 
      case 'create-route':
        return <AddRouteComponent />; 
      case 'assign':
        return <AssignDriverComponent />; 
      case 'AddAdmin':
        return <AddAdminComponent />;  // Add the AddAdminComponent here
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
          <Button variant="ghost" className="text-gray-900" onClick={() => setActiveTab('Search')}>Search</Button>
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
              <DropdownMenuItem onClick={() => setActiveTab('buses')}>Add Bus</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('edit-bus')}>Edit Bus</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('delete-bus')}>Delete Bus</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" className="text-gray-900" onClick={() => setActiveTab('create-route')}>Routes</Button>
          <Button variant="ghost" className="text-gray-900" onClick={() => setActiveTab('assign')}>Assign Driver</Button>
        </nav>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <FaUserCircle className="text-gray-900 cursor-pointer text-2xl" onClick={() => setActiveTab('AddAdmin')} />
          <Button variant="ghost" className="text-red-600 mt-4 sm:mt-0" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      <main className="flex-grow justify-center items-center">
        {renderContent()}
      </main>
    </div>
  );
}
