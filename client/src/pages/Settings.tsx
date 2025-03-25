import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Moon, Sun, Settings as SettingsIcon, Bell, MapPin, Globe, Lock, Info, LogOut, Sliders } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BottomNavigation } from '@/components/BottomNavigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Switch
} from "@/components/ui/switch";

export default function Settings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [units, setUnits] = useState('metric');
  const [language, setLanguage] = useState('english');
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast({
      title: !darkMode ? "Dark mode enabled" : "Light mode enabled",
      description: "Your preference has been saved",
    });
  };
  
  // Toggle notifications
  const toggleNotifications = () => {
    setNotifications(!notifications);
    toast({
      title: !notifications ? "Notifications enabled" : "Notifications disabled",
      description: "Your preference has been saved",
    });
  };
  
  // Toggle location sharing
  const toggleLocationSharing = () => {
    setLocationSharing(!locationSharing);
    toast({
      title: !locationSharing ? "Location sharing enabled" : "Location sharing disabled",
      description: "Your preference has been saved",
    });
  };
  
  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    toast({
      title: "Language updated",
      description: `Language set to ${e.target.value}`,
    });
  };
  
  // Handle units change
  const handleUnitsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnits(e.target.value);
    toast({
      title: "Units updated",
      description: `Units set to ${e.target.value}`,
    });
  };
  
  // Log out (placeholder)
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate("/")}
          className="mr-3 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="h-5 w-5 mr-2 text-amber-500" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how SunSpotter looks for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="mr-2">
                  {darkMode ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-amber-500" />}
                </div>
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-gray-500">Switch between light and dark theme</div>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>
        
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2 text-gray-700" />
              General
            </CardTitle>
            <CardDescription>
              Configure general app settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="mr-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-gray-500">Receive alerts and notifications</div>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={toggleNotifications} />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="mr-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="font-medium">Location Sharing</div>
                  <div className="text-sm text-gray-500">Allow app to access your location</div>
                </div>
              </div>
              <Switch checked={locationSharing} onCheckedChange={toggleLocationSharing} />
            </div>
            
            <div className="py-2">
              <div className="flex items-center mb-2">
                <div className="mr-2">
                  <Globe className="h-5 w-5 text-green-500" />
                </div>
                <div className="font-medium">Language</div>
              </div>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="english">English</option>
                <option value="swedish">Swedish</option>
                <option value="norwegian">Norwegian</option>
                <option value="finnish">Finnish</option>
                <option value="danish">Danish</option>
              </select>
            </div>
            
            <div className="py-2">
              <div className="flex items-center mb-2">
                <div className="mr-2">
                  <Sliders className="h-5 w-5 text-gray-700" />
                </div>
                <div className="font-medium">Units</div>
              </div>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" 
                value={units}
                onChange={handleUnitsChange}
              >
                <option value="metric">Metric (km, °C)</option>
                <option value="imperial">Imperial (miles, °F)</option>
              </select>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-gray-700" />
              Account
            </CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button 
              className="w-full flex items-center justify-between py-3 px-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => navigate("/profile")}
            >
              <span className="font-medium">Profile Settings</span>
              <ArrowLeft className="h-4 w-4 transform rotate-180" />
            </button>
            
            <button 
              className="w-full flex items-center justify-between py-3 px-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => navigate("/about")}
            >
              <span className="font-medium">About SunSpotter</span>
              <Info className="h-4 w-4" />
            </button>
          </CardContent>
          <CardFooter>
            <button 
              className="w-full flex items-center justify-center py-2 px-4 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log Out</span>
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}