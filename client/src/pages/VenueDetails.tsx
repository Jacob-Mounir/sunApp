import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import {
  ArrowLeft, Sun, MapPin, Star, Navigation, Bookmark, Share2,
  Clock, Phone, Globe, Calendar, ExternalLink, Users, ThumbsUp,
  Camera, MessageSquare, Flag, Utensils, Coffee, Beer, TreePine, Flame, Info,
  FileText, CalendarCheck, Edit2, Check, X, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BottomNavigation } from '@/components/BottomNavigation';
import { SunshineForecast } from '@/components/SunshineForecast';
import { Venue } from '@/types';
import { useVenue, useUpdateVenue } from '@/hooks/useVenues';
import { useWeather, isSunnyWeather } from '@/hooks/useWeather';
import { useVenueSunshine, getSunshinePercentage } from '@/hooks/useSunCalculation';
import { useSavedVenues } from '@/hooks/useSavedVenues';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VenueImageUpload } from '@/components/VenueImageUpload';
import config from '../config';

export default function VenueDetails() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/venue/:id');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedVenue, setEditedVenue] = useState<Venue | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State to track active tab
  const [activeTab, setActiveTab] = useState('overview');

  const id = params?.id || '';
  const { data: venue, isLoading: venueLoading, error: venueError } = useVenue(id);
  const queryClient = useQueryClient();
  const updateVenueMutation = useMutation({
    mutationFn: async (venue: Venue) => {
      // Create a clean copy of the venue data with all fields
      const venueData = {
        _id: venue._id,
        name: venue.name,
        venueType: venue.venueType,
        address: venue.address,
        location: venue.location,
        imageUrl: venue.imageUrl,
        hasSunnySpot: venue.hasSunnySpot,
        hasHeaters: venue.hasHeaters,
        sunnySpotDescription: venue.sunnySpotDescription || null,
        city: venue.city || null,
        area: venue.area || null,
        sunHoursStart: venue.sunHoursStart || null,
        sunHoursEnd: venue.sunHoursEnd || null,
        website: venue.website || null,
        rating: venue.rating,
        placeId: venue.placeId
      };

      console.log('Sending venue data to update:', venueData);
      console.log('imageUrl value:', venueData.imageUrl);

      // Convert to JSON string to see what actually gets sent
      const jsonString = JSON.stringify(venueData);
      console.log('Stringified JSON to send:', jsonString);

      // Check if the imageUrl is in the JSON string
      console.log('Does JSON include imageUrl?', jsonString.includes('imageUrl'));

      const response = await fetch(`${config.apiBaseUrl}/venues/${venue._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonString,
      });

      if (!response.ok) {
        throw new Error('Failed to update venue');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue', id] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Venue details updated successfully",
      });
    }
  });

  const { data: weatherData } = useWeather(
    venue?.latitude || 0,
    venue?.longitude || 0
  );

  const { data: sunshineData } = useVenueSunshine(id);

  // Use the saved venues hook
  const { isVenueSaved, toggleSavedVenue } = useSavedVenues();

  // Initialize edited venue when venue data is loaded
  useEffect(() => {
    if (venue) {
      setEditedVenue(venue);
    }
  }, [venue]);

  // Handle errors
  useEffect(() => {
    if (venueError) {
      toast({
        title: "Error",
        description: venueError instanceof Error ? venueError.message : "Failed to load venue details",
        variant: "destructive"
      });
      if (venueError.message === "Venue not found") {
        navigate("/");
      }
    }
  }, [venueError, toast, navigate]);

  const handleEdit = () => {
    // Make a deep copy of the venue data to avoid reference issues
    setEditedVenue(venue ? { ...venue } : null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original venue data
    setEditedVenue(venue ? { ...venue } : null);
    setIsEditing(false);
  };

  // Update the input handlers to properly handle state updates
  const handleInputChange = (field: keyof Venue, value: any) => {
    console.log('Updating field:', field, 'with value:', value); // Debug log
    setEditedVenue(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSunHoursChange = (field: 'sunHoursStart' | 'sunHoursEnd', value: string) => {
    console.log('Updating sun hours:', field, value);
    setEditedVenue(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value || null
      };
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!editedVenue) return;

    setIsUploading(true);
    try {
      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await fetch(`${config.apiBaseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await uploadResponse.json();
      console.log('Received image URL:', imageUrl);

      // Update the local state first
      setEditedVenue(prev => prev ? {
        ...prev,
        imageUrl
      } : null);

      // Create a clean copy of the venue data with all fields
      const updatedVenue: Venue = {
        _id: editedVenue._id,
        id: editedVenue.id,
        name: editedVenue.name,
        venueType: editedVenue.venueType,
        address: editedVenue.address,
        location: editedVenue.location,
        latitude: editedVenue.latitude,
        longitude: editedVenue.longitude,
        imageUrl,
        hasSunnySpot: editedVenue.hasSunnySpot,
        hasHeaters: editedVenue.hasHeaters || false,
        sunnySpotDescription: editedVenue.sunnySpotDescription || null,
        city: editedVenue.city || null,
        area: editedVenue.area || null,
        sunHoursStart: editedVenue.sunHoursStart || null,
        sunHoursEnd: editedVenue.sunHoursEnd || null,
        website: editedVenue.website || null,
        rating: editedVenue.rating,
        placeId: editedVenue.placeId
      };

      console.log('Updating venue with:', updatedVenue);

      // Save venue with new image URL
      await updateVenueMutation.mutateAsync(updatedVenue);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      // Revert the local state on error
      setEditedVenue(prev => prev ? {
        ...prev,
        imageUrl: venue?.imageUrl
      } : null);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editedVenue) return;

    try {
      console.log('Saving venue with data:', editedVenue);

      // Create a clean copy of the venue data with all fields
      const venueToSave: Venue = {
        _id: editedVenue._id,
        id: editedVenue.id,
        name: editedVenue.name,
        venueType: editedVenue.venueType,
        address: editedVenue.address,
        location: editedVenue.location,
        latitude: editedVenue.latitude,
        longitude: editedVenue.longitude,
        imageUrl: editedVenue.imageUrl,
        hasSunnySpot: editedVenue.hasSunnySpot,
        hasHeaters: editedVenue.hasHeaters || false,
        sunnySpotDescription: editedVenue.sunnySpotDescription || null,
        city: editedVenue.city || null,
        area: editedVenue.area || null,
        sunHoursStart: editedVenue.sunHoursStart || null,
        sunHoursEnd: editedVenue.sunHoursEnd || null,
        website: editedVenue.website || null,
        rating: editedVenue.rating,
        placeId: editedVenue.placeId
      };

      console.log('Sending venue data to save:', venueToSave);

      // Save the venue
      await updateVenueMutation.mutateAsync(venueToSave);

      // Success is handled by the mutation's onSuccess callback
    } catch (error) {
      console.error('Error saving venue:', error);
      toast({
        title: "Error",
        description: "Failed to save venue details",
        variant: "destructive",
      });
    }
  };

  const isCurrentlySunny = venue?.hasSunnySpot &&
    isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);

  // Check if this venue is saved
  const isSaved = venue ? isVenueSaved(venue.id) : false;

  // Get sun rating for this venue
  const getSunRating = (venue?: Venue): number => {
    if (!venue || !venue.hasSunnySpot) return 1;

    // Use various venue properties to determine rating
    let rating = 3; // Default middle rating

    // If venue has specified sun hours, use that to calculate rating
    if (venue.sunHoursStart && venue.sunHoursEnd) {
      try {
        const startHour = parseInt(venue.sunHoursStart.split(':')[0]);
        const endHour = parseInt(venue.sunHoursEnd.split(':')[0]);
        const sunHours = endHour - startHour;

        // 1-2 hours: 1 sun
        // 3-4 hours: 2 suns
        // 5-6 hours: 3 suns
        // 7-8 hours: 4 suns
        // 9+ hours: 5 suns
        if (sunHours <= 2) rating = 1;
        else if (sunHours <= 4) rating = 2;
        else if (sunHours <= 6) rating = 3;
        else if (sunHours <= 8) rating = 4;
        else rating = 5;
      } catch (e) {
        // If calculation fails, use a default rating based on hasSunnySpot
        rating = venue.hasSunnySpot ? 3 : 1;
      }
    } else {
      // If no sun hours data, use a rating based on venue type
      // Parks tend to be more sunny, cafes more mixed
      switch (venue.venueType) {
        case 'park':
          rating = 4;
          break;
        case 'restaurant':
          rating = venue.hasHeaters ? 4 : 3;
          break;
        case 'cafe':
          rating = 3;
          break;
        case 'bar':
          rating = venue.hasHeaters ? 4 : 2;
          break;
        default:
          rating = 3;
      }
    }

    return rating;
  };

  // Get the appropriate icon for venue type
  const getVenueIcon = () => {
    if (!venue) return <MapPin className="h-5 w-5" />;

    switch (venue.venueType) {
      case 'restaurant':
        return <Utensils className="h-5 w-5" />;
      case 'cafe':
        return <Coffee className="h-5 w-5" />;
      case 'bar':
        return <Beer className="h-5 w-5" />;
      case 'park':
        return <TreePine className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  // Format venue type label
  const getVenueTypeLabel = () => {
    if (!venue) return '';

    switch (venue.venueType) {
      case 'restaurant':
        return 'Restaurant';
      case 'cafe':
        return 'Café';
      case 'bar':
        return 'Bar';
      case 'park':
        return 'Park';
      default:
        return venue.venueType;
    }
  };

  // Format distance
  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown distance';

    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} meters away`;
    }

    return `${distance.toFixed(1)} kilometers away`;
  };

  // Get directions
  const getDirections = () => {
    if (!venue?.latitude || !venue?.longitude) return;

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`,
      '_blank'
    );
  };

  // Toggle save status
  const toggleSaved = () => {
    if (venue) {
      // Store the current saved state before toggling
      const wasAlreadySaved = isSaved;

      toggleSavedVenue(venue);

      // Show appropriate toast message
      if (!wasAlreadySaved) {
        toast({
          title: "Location saved",
          description: `${venue.name} has been added to your favorites`,
          variant: "default",
        });
      }

      // Add animation class to bookmark icon
      const bookmarkIcon = document.querySelector('.bookmark-icon');
      if (bookmarkIcon) {
        bookmarkIcon.classList.add('bookmark-animation');
        setTimeout(() => {
          bookmarkIcon.classList.remove('bookmark-animation');
        }, 300);
      }
    }
  };

  // Share venue (placeholder function)
  const shareVenue = () => {
    if (navigator.share && venue) {
      navigator.share({
        title: venue.name,
        text: `Check out ${venue.name} on SunSpotter!`,
        url: window.location.href,
      }).catch(() => {
        toast({
          title: "Sharing failed",
          description: "This feature may not be supported in your browser.",
          variant: "destructive"
        });
      });
    } else {
      toast({
        title: "Sharing not supported",
        description: "Web Share API not supported in your browser",
        variant: "destructive"
      });
    }
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

  if (venueLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!venue || !editedVenue) {
    return <div className="flex items-center justify-center min-h-screen">Venue not found</div>;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="relative h-64">
        {/* Image container */}
        <div className="absolute inset-0">
          {(isEditing ? editedVenue?.imageUrl : venue?.imageUrl) ? (
            <div className="relative w-full h-full">
              <img
                src={(isEditing ? editedVenue?.imageUrl : venue?.imageUrl)}
                alt={venue?.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load image:', e.currentTarget.src);
                  e.currentTarget.src = '';
                  toast({
                    title: "Error",
                    description: "Failed to load image",
                    variant: "destructive",
                  });
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-amber-100 to-amber-200" />
          )}
        </div>

        {/* Header controls overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90"
              >
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative">
        <Card>
          <CardContent className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editedVenue.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="venueType">Type</Label>
                  <Select
                    value={editedVenue.venueType}
                    onValueChange={(value) => handleInputChange('venueType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="park">Park</SelectItem>
                      <SelectItem value="beach">Beach</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editedVenue.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="sunHoursStart">Sun Hours</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="sunHoursStart"
                      type="time"
                      value={editedVenue?.sunHoursStart || ''}
                      onChange={(e) => handleSunHoursChange('sunHoursStart', e.target.value)}
                    />
                    <span>to</span>
                    <Input
                      id="sunHoursEnd"
                      type="time"
                      value={editedVenue?.sunHoursEnd || ''}
                      onChange={(e) => handleSunHoursChange('sunHoursEnd', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasSunnySpot"
                    checked={editedVenue.hasSunnySpot}
                    onCheckedChange={(checked) => handleInputChange('hasSunnySpot', checked)}
                  />
                  <Label htmlFor="hasSunnySpot">Has Sunny Spot</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasHeaters"
                    checked={editedVenue.hasHeaters}
                    onCheckedChange={(checked) => handleInputChange('hasHeaters', checked)}
                  />
                  <Label htmlFor="hasHeaters">Has Outdoor Heating</Label>
                </div>

                <div>
                  <Label>Venue Image</Label>
                  <VenueImageUpload
                    currentImageUrl={editedVenue.imageUrl}
                    onUpload={handleImageUpload}
                    isUploading={isUploading}
                  />
                </div>

                <div>
                  <Label htmlFor="sunnySpotDescription">Sunny Spot Description</Label>
                  <Textarea
                    id="sunnySpotDescription"
                    value={editedVenue.sunnySpotDescription || ''}
                    onChange={(e) => handleInputChange('sunnySpotDescription', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{venue.name}</h1>
                    <div className="flex items-center text-gray-600 mt-1">
                      {getVenueIcon()}
                      <span className="ml-1">{getVenueTypeLabel()}</span>
                      <span className="mx-2">•</span>
                      <span>{venue.area || 'Östra Centrum'}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-amber-100 rounded-full px-3 py-1 flex items-center">
                      <Sun className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="font-medium">{getSunRating(venue)}.0</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{venue.address}</span>
                  </div>

                  {(venue.sunHoursStart && venue.sunHoursEnd) && (
                    <div className="flex items-center text-gray-600">
                      <Sun className="h-5 w-5 mr-2" />
                      <span>Sun Hours: {venue.sunHoursStart} - {venue.sunHoursEnd}</span>
                    </div>
                  )}

                  {venue.hasHeaters && (
                    <div className="flex items-center text-gray-600">
                      <Flame className="h-5 w-5 mr-2 text-orange-500" />
                      <span>Outdoor heating available</span>
                    </div>
                  )}

                  {venue.sunnySpotDescription && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">About the sunny spot</h3>
                      <p className="text-gray-600">{venue.sunnySpotDescription}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="sun">
                <Sun className="h-4 w-4 mr-2" />
                Sun Hours
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <MessageSquare className="h-4 w-4 mr-2" />
                Reviews
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tabbed Content */}
        <div className="mt-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              {/* Sun Exposure */}
              <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300 flex items-center">
                  <Sun className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" fill="currentColor" />
                  Sun Exposure
                </h2>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {isCurrentlySunny ? (
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center mr-3 shadow-md relative overflow-hidden">
                        <Sun className="h-6 w-6 text-white" />
                        <div className="absolute inset-0 rounded-full glow-animation"></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Sun className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {isCurrentlySunny ? 'Sunny right now!' : 'Not currently sunny'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isCurrentlySunny
                          ? 'This location has direct sunlight now'
                          : 'Check back later for sunshine'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sun hours */}
                {venue.sunHoursStart && venue.sunHoursEnd && (
                  <div className="mt-4 bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-amber-600 mr-2" />
                      <p className="text-sm font-medium text-amber-800">
                        Sun Hours: {venue.sunHoursStart} - {venue.sunHoursEnd}
                      </p>
                    </div>

                    {/* Sunshine percentage */}
                    {sunshineData && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-amber-700">Sunshine coverage</p>
                          <p className="text-xs font-medium text-amber-800">
                            {getSunshinePercentage(sunshineData)}%
                          </p>
                        </div>
                        <div className="w-full bg-amber-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full"
                            style={{ width: `${getSunshinePercentage(sunshineData)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sunny spot description */}
                {venue.sunnySpotDescription && (
                  <div className="mt-4 p-3 border border-amber-200 dark:border-amber-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      "{venue.sunnySpotDescription}"
                    </p>
                  </div>
                )}

                {/* Outdoor heating */}
                {venue.hasHeaters !== undefined && (
                  <div className="mt-4 flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center mr-3
                      ${venue.hasHeaters
                        ? 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                        : 'bg-gray-200 text-gray-400'}
                    `}>
                      <Flame className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {venue.hasHeaters
                        ? 'Outdoor heating available'
                        : 'No outdoor heating'}
                    </p>
                  </div>
                )}
              </div>

              {/* Details & Amenities */}
              <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Details & Amenities
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {venue.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</p>
                        <a
                          href={venue.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                        >
                          Visit website
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Best Season</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Spring & Summer</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Crowds</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {venue.venueType === 'park' ? 'Usually spacious' : 'Moderate'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <ThumbsUp className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recommended</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {getSunRating(venue) >= 4 ? 'Highly recommended' : 'Recommended'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                  <Phone className="h-5 w-5 text-gray-600 mr-2" />
                  Contact Information
                </h2>

                <div className="space-y-4">
                  {venue.phoneNumber && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
                        <a
                          href={`tel:${venue.phoneNumber}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {venue.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {venue.email && (
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                        <a
                          href={`mailto:${venue.email}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {venue.email}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4">
                    {venue.website && (
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center"
                      >
                        <Globe className="h-4 w-4 mr-1.5" />
                        Website
                      </a>
                    )}

                    {venue.instagramUrl && (
                      <a
                        href={venue.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm flex items-center"
                      >
                        <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                        Instagram
                      </a>
                    )}

                    {venue.facebookUrl && (
                      <a
                        href={venue.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-sm flex items-center"
                      >
                        <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                        </svg>
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sun Hours Tab */}
          {activeTab === 'sun' && (
            <div className="tab-content">
              {/* Sun Hours Content */}
              <div className="mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300 flex items-center mb-4">
                  <Sun className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" fill="currentColor" />
                  Sun Hours Detail
                </h2>

                {venue.sunHoursStart && venue.sunHoursEnd ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                          <Sun className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-800">
                            Daily Sun Hours
                          </p>
                          <p className="text-sm text-amber-600">
                            {venue.sunHoursStart} - {venue.sunHoursEnd}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sunshine percentage */}
                    {sunshineData && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-700 font-medium">Sunshine coverage</p>
                          <p className="text-sm font-medium text-amber-800">
                            {getSunshinePercentage(sunshineData)}%
                          </p>
                        </div>
                        <div className="w-full bg-amber-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full"
                            style={{ width: `${getSunshinePercentage(sunshineData)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sun className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No detailed sun hours available for this venue.</p>
                  </div>
                )}
              </div>

              {/* Sunshine Forecast */}
              <div className="mx-4 mt-4">
                <SunshineForecast venueId={venue.id} />
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="tab-content">
              {/* Venue Image */}
              <div className="mx-4 mb-4">
                {venue.imageUrl ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={venue.imageUrl}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load image:', e.currentTarget.src);
                        e.currentTarget.src = '';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-xl bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        {getVenueIcon()}
                      </div>
                      <span className="text-amber-800 text-xl font-medium">{venue.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Operating Hours */}
              <div className="mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                  <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  Operating Hours
                </h2>

                {(venue.mondayHours || venue.tuesdayHours || venue.wednesdayHours ||
                  venue.thursdayHours || venue.fridayHours || venue.saturdayHours ||
                  venue.sundayHours) ? (
                  <div className="space-y-2">
                    {venue.mondayHours && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monday</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{venue.mondayHours}</span>
                      </div>
                    )}
                    {venue.tuesdayHours && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tuesday</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{venue.tuesdayHours}</span>
                      </div>
                    )}
                    {venue.wednesdayHours && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wednesday</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{venue.wednesdayHours}</span>
                      </div>
                    )}
                    {venue.thursdayHours && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thursday</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{venue.thursdayHours}</span>
                      </div>
                    )}
                    {venue.fridayHours && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Friday</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{venue.fridayHours}</span>
                      </div>
                    )}
                    {venue.saturdayHours && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Saturday</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{venue.saturdayHours}</span>
                      </div>
                    )}
                    {venue.sundayHours && (
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sunday</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{venue.sundayHours}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No operating hours available for this venue.</p>
                  </div>
                )}
              </div>

              {/* Best Seasons */}
              <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                  Best Times to Visit
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-green-700">Spring</p>
                    <p className="text-xs text-green-600 mt-1">Early sunshine in pleasant temperatures</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-green-500 text-xs mr-1">Mar-May</span>
                      <div className="flex-1 h-1.5 bg-green-200 rounded-full">
                        <div className="h-1.5 bg-green-400 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-sm font-medium text-amber-700">Summer</p>
                    <p className="text-xs text-amber-600 mt-1">Maximum sunshine hours</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-amber-500 text-xs mr-1">Jun-Aug</span>
                      <div className="flex-1 h-1.5 bg-amber-200 rounded-full">
                        <div className="h-1.5 bg-amber-400 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-orange-50">
                    <p className="text-sm font-medium text-orange-700">Autumn</p>
                    <p className="text-xs text-orange-600 mt-1">Soft afternoon light</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-orange-500 text-xs mr-1">Sep-Nov</span>
                      <div className="flex-1 h-1.5 bg-orange-200 rounded-full">
                        <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-sm font-medium text-blue-700">Winter</p>
                    <p className="text-xs text-blue-600 mt-1">Limited sunshine</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-blue-500 text-xs mr-1">Dec-Feb</span>
                      <div className="flex-1 h-1.5 bg-blue-200 rounded-full">
                        <div className="h-1.5 bg-blue-400 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="tab-content">
              <div className="mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                  <MessageSquare className="h-5 w-5 text-gray-600 mr-2" />
                  Reviews
                </h2>

                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No reviews yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share your experience!</p>

                  <button className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Write a review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 px-4">
        <Button variant="outline" className="flex-1 mr-2" onClick={getDirections}>
          <Navigation className="h-4 w-4 mr-2" />
          Get Directions
        </Button>
        <Button variant="default" className="flex-1 ml-2" onClick={toggleSaved}>
          <Bookmark className={`h-4 w-4 mr-2 bookmark-icon ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      </div>

      <BottomNavigation activeItem="explore" onItemClick={handleNavItemClick} />
    </div>
  );
}