import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;


export default function AssignDriverComponent() {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [busesRes, driversRes, routesRes] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/buses`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
          axios.get(`${backendUrl}/api/admin/drivers`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
          axios.get(`${backendUrl}/api/admin/routes`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        ]);
  

  
        // Use API data directly
        setBuses(busesRes.data);  
        setDrivers(driversRes.data);
        setRoutes(routesRes.data);
  
      } catch (error) {
        console.error("Error fetching options:", error);
        alert("Failed to load options. Please try again.");
      }
    };
  
    fetchOptions();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBus) {
      alert("Please select a bus.");
      return;
    }
    if (selectedDrivers.length === 0) {
      alert("Please select at least one driver.");
      return;
    }
    if (selectedRoutes.length === 0) {
      alert("Please select at least one route.");
      return;
    }

    const payload = {
        busId: selectedBus?.value,
        driverIds: selectedDrivers.map((driver) => Number(driver.value)), 
        routeIds: selectedRoutes.map((route) => Number(route.value)), 
      };
      
      
      console.log("Submitting payload:", payload);
      
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/admin/assign-driver`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert(response.data.message || "Assignment successful!");
      setSelectedBus(null);
      setSelectedDrivers([]);
      setSelectedRoutes([]);
    } catch (error) {
      console.error("Error assigning drivers and routes:", error);
      alert(error.response?.data?.message || "Error during assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-center mb-6">Assign Drivers and Routes</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Select Bus</label>
          <Select
            options={buses}
            onChange={setSelectedBus}
            value={selectedBus}
            placeholder="Choose a Bus"
            isClearable
            />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Assign Drivers</label>
          <Select
            isMulti
            options={drivers}
            onChange={setSelectedDrivers}
            value={selectedDrivers}
            placeholder="Select Drivers"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Assign Routes</label>
          <Select
            isMulti
            options={routes}
            onChange={setSelectedRoutes}
            value={selectedRoutes}
            placeholder="Select Routes"
          />
        </div>

        <Button
          type="submit"
          className={`w-full py-3 rounded-md ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          disabled={loading}
        >
          {loading ? "Assigning..." : "Assign"}
        </Button>
      </form>
    </div>
  );
}
