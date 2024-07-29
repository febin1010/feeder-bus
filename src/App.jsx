import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Correct import for BrowserRouter
import { LoginForm } from './components/LoginPage'; // Ensure the path is correct and LoginForm is correctly exported
import DriverDashboard from './components/DriverDashboard';
import PassengerDashboard from './components/Passengerdetails'; // Ensure the path is correct

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/passenger-dashboard" element={<PassengerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
