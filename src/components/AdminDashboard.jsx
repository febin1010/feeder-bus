import React from 'react';
import { Button } from "@/components/ui/button"; // Adjust the import path as necessary
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow-md rounded-lg mb-8">
        <div className="flex items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" className="text-gray-900">
            Overview
          </Button>
          <Button variant="ghost" className="text-gray-900">
            Settings
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-6">
        <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-6 bg-white shadow-md rounded-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-semibold">
              Welcome to the Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-lg text-gray-700">
              This is the main dashboard area. You can add your dashboard components here.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full py-2 sm:py-3 md:py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Explore
            </Button>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-white text-center shadow-md rounded-lg mt-8">
        <p className="text-gray-700">&copy; 2024 Company Name. All rights reserved.</p>
      </footer>
    </div>
  );
}
