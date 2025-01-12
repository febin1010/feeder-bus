import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(""); 
  const [driverDetails, setDriverDetails] = useState(null);
  const [trips, setTrips] = useState([]);
  const [passengerList, setPassengerList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const token = localStorage.getItem("token");
  if (!token) {
    alert("No authentication token found");
    return null;
  }

  const handleSearch = async () => {
    setDriverDetails(null);
    setTrips([]);
    setPassengerList([]);
    setIsLoading(true);
  
    try {
      let response;
  
      if (searchTerm && busNumber) {
        alert("Please fill in only one search field (Driver Number or Bus Number).");
        return;
      } else if (!searchTerm && !busNumber) {
        alert("Please fill in either Driver Number or Bus Number.");
        return;
      }

      const dateParams =
      fromDate && toDate ? `&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}` : "";
    
    if (searchTerm) {
      response = await fetch(
        `${backendUrl}/api/admin/searchDriver?term=${encodeURIComponent(searchTerm)}${dateParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } else if (busNumber) {
      response = await fetch(
        `${backendUrl}/api/admin/searchBus?busNo=${encodeURIComponent(busNumber)}${dateParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      } else {
        alert("Please fill in either Driver Number or Bus Number.");
        return;
      }

      if (response.status === 404) {
        const errorData = await response.json();
        alert(errorData.message);
        return;
      }
  
      if (!response.ok) throw new Error("Failed to fetch");
  
      const results = await response.json();


        if (results.driverDetails) {
        setDriverDetails(results.driverDetails);
        setTrips(results.trips || []);
      } else if (results.tripDetails) {
        setTrips(results.tripDetails);
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPassengers = async (tripId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/trip/${tripId}/passengers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch passengers");
  
      const { passengerList } = await response.json(); // Correctly destructure passengerList
      setPassengerList(passengerList || []);
    } catch (error) {
      console.error("Passenger fetch error:", error);
      alert("Failed to fetch passengers for this trip.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 h-full p-4 flex flex-col justify-center items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white shadow-xl rounded-3xl w-full max-w-4xl p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.h2
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Search for Driver Details or Bus
          </motion.h2>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-lg text-gray-600 text-center"
          >
            Search by Driver Number or Bus Number to get details.
          </motion.p>
        </div>

        <div className="flex justify-center w-full mb-6">
          <div className="w-full flex space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Driver Number"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="text"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              placeholder="Enter Bus Number"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="relative mb-6">
      <div className="flex items-center border-2 border-gray-300 rounded-lg">
        <div className="flex-grow p-3 flex items-center space-x-4">
          {/* From Date Container */}
          <div className="flex items-center flex-grow relative">
            <Calendar className="absolute left-2 text-gray-400 z-10" size={20} />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full pl-8 pr-6 bg-transparent outline-none text-gray-700 cursor-pointer"
              placeholder="From Date"
            />
            {fromDate && (
              <button
                onClick={() => setFromDate('')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 mr-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Separator */}
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          
          {/* To Date Container */}
          <div className="flex items-center flex-grow relative">
            <Calendar className="absolute left-2 text-gray-400 z-10" size={20} />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full pl-8 pr-6 bg-transparent outline-none text-gray-700 cursor-pointer"
              placeholder="To Date"
            />
            {toDate && (
              <button
                onClick={() => setToDate('')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 mr-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

        <div className="mb-6">
          <Button
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-3 px-6"
          >
            Search
          </Button>
        </div>

        
        {driverDetails && (
          <Card className="bg-white shadow-xl rounded-xl p-6 mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Driver Details</CardTitle>
              <CardDescription className="text-gray-600">
                Information about the driver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-gray-700">
                  <strong>Driver Name:</strong> {driverDetails.name}
                </p>
                <p className="text-gray-700">
                  <strong>Driver Number:</strong> {driverDetails.driver_number}
                </p>
                <p className="text-gray-700">
                  <strong>License Number:</strong> {driverDetails.license_number}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {driverDetails.email}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {trips.length > 0 && (
          <Card className="bg-white shadow-xl rounded-xl p-6 mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {busNumber ? "Bus Trips" : "Driver's Trips"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                Select a trip to view passengers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {trips.map((trip) => (
                  <li
                    key={`${trip.trip_id}-${trip.bus_no}`}
                    className="flex flex-col md:flex-row justify-between items-center"
                  >
                    <div className="text-gray-700 w-full md:w-3/4">
                      <p>
                        <strong>Trip ID:</strong> {trip.trip_id} |{" "}
                        <strong>Bus Number:</strong> {trip.bus_no}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(trip.date).toLocaleDateString()} |{" "}
                        <strong>Time:</strong> {trip.time} - {trip.end_time}
                      </p>
                      <p>
                        <strong>Driver Name:</strong> {trip.driver_name} |{" "}
                        <strong>Route:</strong> {trip.trip_route || "Not Available"}
                      </p>
                    </div>
                    <Button
                      onClick={() => fetchPassengers(trip.trip_id)}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg mt-4 md:mt-0"
                    >
                      View Passengers
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}


          {passengerList.length > 0 && (
            <Card className="bg-white shadow-xl rounded-xl p-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Passenger Information</CardTitle>
                <CardDescription className="text-gray-600">
                  List of passengers for the selected trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                <table className="min-w-full table-auto">
                  <thead className="text-left border-b-2">
                    <tr>
                      <th className="py-3 px-4 text-sm text-gray-600">Passenger Name</th>
                      <th className="py-3 px-4 text-sm text-gray-600">Payment Mode</th>
                      <th className="py-3 px-4 text-sm text-gray-600">Deboarded</th>
                      <th className="py-3 px-4 text-sm text-gray-600">Deboarded Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengerList.map((passenger, index) => (
                      <tr key={`${passenger.passengerName.trim()}-${index}`} className="hover:bg-gray-50 border-b">
                        <td className="py-3 px-4 text-gray-700">{passenger.passengerName.trim()}</td>
                        <td className="py-3 px-4 text-gray-700">{passenger.paymentmode}</td>
                        <td className="py-3 px-4 text-gray-700">{passenger.is_deboarded ? "Yes" : "No"}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {passenger.deboarded_time
                            ? new Date(passenger.deboarded_time).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

      </motion.div>
    </div>
  );
}

export default SearchComponent;
