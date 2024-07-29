import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { LoginForm } from './components/LoginPage'
import DriverDashboard from './components/DriverDashboard'
import PassengerDashboard from './components/Passengerdetails'


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
export default App
