import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function AddRouteComponent() {
  const [routeDetails, setRouteDetails] = useState({
    from: "",
    to: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRouteDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please log in again.");
      return;
    }
  
    try {
      const response = await fetch(`${backendUrl}/api/admin/add-route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(routeDetails),
      });
  
      const responseText = await response.text();
  
      if (response.status === 404) {
        alert("API endpoint not found. Please check the backend URL.");
        return;
      }
  
      if (response.status === 409) {
        alert("This route already exists.");
        return;
      }
  
      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || "Failed to create route");
        } catch (err) {
          throw new Error(responseText || "An unexpected error occurred.");
        }
      }
        alert("Route Created Successfully!");
  
      // Clear the form after successful submission
      setRouteDetails({ from: "", to: "" });
    } catch (error) {
      console.error("Error:", error.message);
      alert(`An error occurred: ${error.message}`);
    }
  };


  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
        Create a New Route
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* From Input */}
        <div>
          <label htmlFor="from" className="block text-gray-700 font-medium mb-2">
            From
          </label>
          <input
            id="from"
            name="from"
            type="text"
            placeholder="Starting Location"
            value={routeDetails.from}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* To Input */}
        <div>
          <label htmlFor="to" className="block text-gray-700 font-medium mb-2">
            To
          </label>
          <input
            id="to"
            name="to"
            type="text"
            placeholder="Destination"
            value={routeDetails.to}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition duration-300"
          >
            Create Route
          </Button>
        </div>
      </form>
    </div>
  );
}
