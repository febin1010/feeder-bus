import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Bus,
  Route,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  Star,
  Clock,
  MapPin,
} from "lucide-react";

// Enhanced Animated Background with more dynamic particles
const EnhancedAnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');    // Soft blue
    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)');  // Indigo
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.1)');    // Purple

    const particles = [];
    const particleCount = 200;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.color = `rgba(${Math.random() * 50 + 100}, ${Math.random() * 50 + 150}, ${Math.random() * 50 + 200}, ${this.opacity})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around with slight bounce effect
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export function AdminDashboardHome({ chartData, visitorChartData, passengerData }) {
  const [timeRange, setTimeRange] = useState("90d");
  const [activePassengerIndex, setActivePassengerIndex] = useState(null);
  const adminName = localStorage.getItem("adminName") || "Admin";

  const chartConfig = {
    desktop: {
      color: "#3B82F6", // Example color, change as needed
    },
    mobile: {
      color: "#9333EA", // Example color, change as needed
    },
  };
  

  const filteredVisitorData = visitorChartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  const StatCard = ({ icon, title, value, color, percentage, additionalInfo }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card className={`bg-white border-0 shadow-2xl rounded-3xl overflow-hidden ${color} transform transition-all duration-300`}>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${color} bg-opacity-20 group-hover:rotate-12 transition-transform`}>
                {icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {percentage && (
                <div className="flex items-center text-green-500 font-semibold">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>{percentage}%</span>
                </div>
              )}
              {additionalInfo && (
                <p className="text-xs text-gray-500 mt-1">{additionalInfo}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderActiveShape = (props) => {
    const { 
      cx, cy, midAngle, innerRadius, outerRadius, 
      startAngle, endAngle, fill, payload, percent 
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="transition-all duration-300 drop-shadow-lg"
        />
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActivePassengerIndex(index);
  };

  const onPieLeave = () => {
    setActivePassengerIndex(null);
  };

  // Define your color arrays
  const COLORS = [
    "#3B82F6", // Blue-500
    "#4F46E5", // Indigo-500
    "#6D28D9", // Purple-600
    "#8B5CF6", // Violet-500
    "#A855F7", // Fuchsia-500
  ];
  
  const HOVER_COLORS = [
    "#2563EB", // Blue-600
    "#3730A3", // Indigo-700
    "#5B21B6", // Purple-700
    "#7C3AED", // Violet-700
    "#9333EA", // Fuchsia-700
  ];
  
  
  return (
<div className="bg-gradient-to-r from-blue-500 to-purple-600 h-[80vh] p-6 space-y-8 relative overflow-hidden rounded-lg shadow-xl">


    <EnhancedAnimatedBackground />
      
      {/* Animated Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 opacity-20 scale-150">
          <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path 
              fill="#FFFFFF" 
              d="M40.7,-70.4C53.1,-62.5,64.3,-52.1,70.8,-40.4C77.3,-28.7,79.1,-15.7,77.1,-3.7C75.1,8.3,69.3,16.6,63.4,24.5C57.5,32.4,51.5,40,44.1,47.1C36.7,54.2,28,60.9,17.6,66.5C7.2,72.1,-5.9,76.6,-18.6,75.5C-31.3,74.4,-43.6,67.8,-54.4,60.2C-65.2,52.7,-74.4,44.3,-78.1,34.1C-81.8,23.9,-80,12,-76.4,1.5C-72.8,-9,-67.5,-18.1,-62.9,-28.4C-58.4,-38.7,-54.7,-50.3,-47.4,-59.5C-40.1,-68.7,-29.2,-75.5,-17.1,-81.4C-5,-87.3,7.3,-92.4,19.7,-87.9C32.1,-83.4,44.6,-69.3,40.7,-70.4Z" 
              transform="translate(100 100)" 
            />
          </svg>
        </div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <motion.h2 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-bold mb-3 tracking-tight"
            >
              Welcome, {adminName}
            </motion.h2>
            <motion.p 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-blue-100 text-lg flex items-center"
            >
              Transportation Management Dashboard <ChevronRight className="ml-2" />
            </motion.p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
          </motion.div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          title="Total Drivers"
          value={chartData.barChartData.find((item) => item.name === "Drivers")?.value || 0}
          color="bg-white"
          additionalInfo="Total drivers"
        />
        <StatCard
          icon={<Bus className="w-6 h-6 text-green-600" />}
          title="Total Buses"
          value={chartData.barChartData.find((item) => item.name === "Buses")?.value || 0}
          color="bg-white"
          additionalInfo="Active Fleet"
        />
        <StatCard
          icon={<Route className="w-6 h-6 text-purple-600" />}
          title="Total Routes"
          value={chartData.barChartData.find((item) => item.name === "Routes")?.value || 0}
          color="bg-white"
          additionalInfo="Operational Routes"
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Visitors Overview */}
        <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <span>Visitors Overview</span>
                </CardTitle>
                <CardDescription className="mt-2">Passenger Preference for Payment</CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px] rounded-lg">
                  <SelectValue placeholder="Last 3 months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                  <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                  <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
            <CardContent className="p-6 pt-0">
                <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={filteredVisitorData}>
                    <defs>
                    <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartConfig.desktop.color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartConfig.desktop.color} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartConfig.mobile.color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartConfig.mobile.color} stopOpacity={0.1}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <RechartsTooltip />
                    <Area 
                    type="monotone" 
                    dataKey="online" 
                    stroke={chartConfig.mobile.color} 
                    fillOpacity={1} 
                    fill="url(#colorMobile)" 
                    />
                    <Area 
                    type="monotone" 
                    dataKey="offline" 
                    stroke={chartConfig.desktop.color} 
                    fillOpacity={1} 
                    fill="url(#colorDesktop)" 
                    />
                </AreaChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>

        {/* Passengers Per Month */}
        <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-xl flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-red-500" />
              <span>Passengers Per Month</span>
            </CardTitle>
            <CardDescription>Distribution of passengers in recent months</CardDescription>
          </CardHeader>
            <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {passengerData && passengerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                <Pie
                    data={passengerData}
                    dataKey="percentage"
                    nameKey="month"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    activeIndex={activePassengerIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                >
                    {passengerData.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={
                        activePassengerIndex === index
                            ? HOVER_COLORS[index % HOVER_COLORS.length]
                            : COLORS[index % COLORS.length]
                        }
                    />
                    ))}
                </Pie>
                </PieChart>
            </ResponsiveContainer>
            ) : (
            <p>No passenger data available.</p>
            )}

                {activePassengerIndex !== null && passengerData?.[activePassengerIndex] && (
                <div className="bg-gray-100 p-4 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold mb-2 text-gray-800">
                    {passengerData[activePassengerIndex].month} Details
                    </h3>
                    <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Passengers</span>
                        <span className="font-semibold text-blue-600">
                        {passengerData[activePassengerIndex].passengers}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Percentage</span>
                        <span className="font-semibold text-green-600">
                        {passengerData[activePassengerIndex].percentage}%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {passengerData[activePassengerIndex].details}
                    </p>
                    </div>
                </div>
                )}
            </div>
            </CardContent>

            </Card>        
        </motion.div>
        </div>
    );
    }

    export default AdminDashboardHome;  