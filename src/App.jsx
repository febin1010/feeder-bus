import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginForm } from './components/LoginPage';
import DriverDashboard from './components/DriverDashboard';
import PassengerDashboard from './components/Passengerdetails';
import IndexPage from './components/IndexPage';
import { AdminLogin } from './components/adminLoginPage';
import { AdminDashboard } from './components/AdminDashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/passenger-dashboard" element={<PassengerDashboard />} />
        <Route path="/admin-login" element={<AdminLogin/>}/>
        <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
