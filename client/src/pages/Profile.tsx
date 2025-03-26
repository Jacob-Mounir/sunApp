import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Home, 
  Save,
  Trash
} from 'lucide-react';
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  address: string;
}

export default function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Mock initial profile data
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Andersson',
    email: 'alex@example.com',
    phone: '+46 70 123 4567',
    avatarUrl: '',
    address: 'Göteborg, Sweden'
  });
  
  // State for input fields
  const [formData, setFormData] = useState<UserProfile>({...profile});
  
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
        {/* Profile Avatar */}
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
                <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                <AvatarFallback className="bg-amber-100 text-amber-600 text-xl">
                  {getInitials(formData.name)}
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
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
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
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
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
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={cancelChanges}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveChanges}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
        
        {/* Danger Zone */}
        <Card className="border-red-100">
          <CardHeader className="text-red-600">
            <CardTitle className="flex items-center">
              <Trash className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-400">
              Irreversible account actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={deleteAccount}>
                    Yes, delete my account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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