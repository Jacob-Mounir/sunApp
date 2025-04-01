import React from 'react';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import SavedLocations from "@/pages/SavedLocations";
import About from "@/pages/About";
import VenueDetails from "@/pages/VenueDetails";
import { ThemeProvider } from "@/hooks/useTheme";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AuthProvider } from "@/contexts/AuthContext";

function Router() {
  const [location] = useLocation();

  // Log current location for debugging
  console.log("Current location:", location);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile" component={Profile} />
      <Route path="/saved" component={SavedLocations} />
      <Route path="/about" component={About} />
      <Route path="/venue/:id" component={VenueDetails} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
