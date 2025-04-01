import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Camera,
  Home,
  Save,
  Trash,
  LogIn,
  Github,
  KeyRound
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  address: string;
}

export default function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, logout, loginWithGoogle } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Initial profile data based on authenticated user
  const [profile, setProfile] = useState<UserProfile>({
    fullName: user?.fullName || user?.username || '',
    email: user?.email || '',
    phone: '',
    avatarUrl: user?.avatarUrl || '',
    address: 'Göteborg, Sweden'
  });

  // State for input fields
  const [formData, setFormData] = useState<UserProfile>({...profile});

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      const updatedProfile = {
        ...profile,
        fullName: user.fullName || user.username || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || ''
      };
      setProfile(updatedProfile);
      setFormData(updatedProfile);
    }
  }, [user]);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save profile changes
  const saveChanges = () => {
    setProfile(formData);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved",
    });
  };

  // Cancel changes
  const cancelChanges = () => {
    setFormData({...profile});
    toast({
      title: "Changes discarded",
      description: "Your changes have been discarded",
    });
  };

  // Handle avatar change
  const handleAvatarChange = () => {
    // In a real app, this would open a file picker
    // For now, just add a placeholder image
    const newAvatarUrl = 'https://source.unsplash.com/random/100x100/?person';
    setFormData({
      ...formData,
      avatarUrl: newAvatarUrl
    });

    toast({
      title: "Avatar updated",
      description: "Your profile picture has been updated",
    });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive"
      });
    }
  };

  // Delete account (placeholder)
  const deleteAccount = () => {
    setDeleteDialogOpen(false);
    toast({
      title: "Account deleted",
      description: "Your account has been successfully deleted",
      variant: "destructive"
    });
    navigate("/login");
  };

  // Navigation handler for bottom navigation
  const handleNavItemClick = (item: 'explore' | 'saved' | 'settings') => {
    if (item === 'explore') {
      navigate('/');
    } else if (item === 'saved') {
      navigate('/saved');
    } else if (item === 'settings') {
      navigate('/settings');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Check if user has Google connected
  const hasGoogleConnected = !!user?.googleId;

  // If user is not logged in, show loading state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl flex items-center justify-center min-h-screen">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <Button onClick={() => navigate("/login")} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format account creation date if available
  const createdDate = user.createdAt ?
    new Date(user.createdAt).toLocaleDateString() :
    new Date().toLocaleDateString();

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl pb-20">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/settings")}
          className="mr-3 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Avatar Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Profile Picture
            </CardTitle>
            <CardDescription>
              Customize your profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-4 relative">
              <Avatar className="h-24 w-24 border-2 border-amber-200">
                <AvatarImage src={formData.avatarUrl} alt={formData.fullName} />
                <AvatarFallback className="bg-amber-100 text-amber-600 text-xl">
                  {getInitials(formData.fullName || user.username)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-amber-500 hover:bg-amber-600"
                onClick={handleAvatarChange}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Click the camera icon to update your profile picture
            </p>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your SunSpotter account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Username</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Account created</span>
                <span className="font-medium">{createdDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Account status</span>
                <span className={`font-medium ${user.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-9"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-9"
                  disabled
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email changes require verification. Contact support to update.
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-9"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Location</Label>
              <div className="relative">
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="pl-9"
                />
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" onClick={cancelChanges}>Discard</Button>
            <Button onClick={saveChanges} className="bg-amber-500 hover:bg-amber-600">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        {/* Authentication Methods Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <KeyRound className="h-5 w-5 mr-2 text-blue-500" />
              Authentication Methods
            </CardTitle>
            <CardDescription>
              Connect your account with other services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign-in */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Google</h4>
                  <p className="text-xs text-gray-500">
                    {hasGoogleConnected
                      ? "Your account is connected with Google"
                      : "Connect with your Google account"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={hasGoogleConnected}
                onClick={() => hasGoogleConnected ? undefined : loginWithGoogle()}
              >
                {hasGoogleConnected ? "Connected" : "Connect"}
              </Button>
            </div>

            {/* GitHub Sign-in */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="bg-gray-100 p-2 rounded-full mr-3">
                  <Github className="h-5 w-5 text-gray-800" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">GitHub</h4>
                  <p className="text-xs text-gray-500">Connect with your GitHub account</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>

            <Separator className="my-2" />

            <Alert className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertTitle className="text-amber-800">Coming Soon</AlertTitle>
              <AlertDescription>
                Social login options will be available in the next update.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Trash className="h-5 w-5 mr-2 text-red-600" />
              Account Actions
            </CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50"
                onClick={handleLogout}
              >
                <LogIn className="h-4 w-4 mr-2 rotate-180" />
                Log Out
              </Button>

              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete your account?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-red-50 p-3 rounded-md border border-red-100 text-sm text-red-600">
                    All your saved locations, preferences, and personal information will be lost.
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={deleteAccount}
                    >
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation
        activeItem="settings"
        onItemClick={handleNavItemClick}
      />
    </div>
  );
}