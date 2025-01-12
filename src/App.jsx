import React,{ useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginForm } from './components/LoginPage';
import DriverDashboard from './components/DriverDashboard';
import PassengerDashboard from './components/Passengerdetails';
import IndexPage from './components/IndexPage';
import { AdminLogin } from './components/adminLoginPage';
import { AdminDashboard } from './components/AdminDashboard';



function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Router basename="/react_app"> {/* Set the base path */}
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
