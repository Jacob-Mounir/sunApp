import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Venue } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';

export function AdminDashboard() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch venues
  const { data: venues, isLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: () => apiRequest('/api/venues'),
  });

  // Update venue mutation
  const updateVenueMutation = useMutation({
    mutationFn: (venue: Partial<Venue>) =>
      apiRequest(`/api/venues/${venue._id}`, {
        method: 'PUT',
        body: JSON.stringify(venue),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: 'Success',
        description: 'Venue updated successfully',
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update venue',
        variant: 'destructive',
      });
    },
  });

  // Handle venue selection
  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsEditing(false);
  };

  // Handle venue update
  const handleVenueUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue) return;

    updateVenueMutation.mutate(selectedVenue);
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!selectedVenue) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiRequest('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setSelectedVenue(prev => prev ? {
        ...prev,
        imageUrl: response.imageUrl
      } : null);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Venue Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Venue List */}
        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {venues?.map((venue: Venue) => (
                <div
                  key={venue._id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedVenue?._id === venue._id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`}
                  onClick={() => handleVenueSelect(venue)}
                >
                  {venue.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Venue Details */}
        {selectedVenue && (
          <Card>
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="mt-2"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVenueUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={selectedVenue.name}
                    onChange={(e) => setSelectedVenue(prev => prev ? { ...prev, name: e.target.value } : null)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="venueType">Type</Label>
                  <Select
                    value={selectedVenue.venueType}
                    onValueChange={(value) => setSelectedVenue(prev => prev ? { ...prev, venueType: value } : null)}
                    disabled={!isEditing}
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
                    value={selectedVenue.address}
                    onChange={(e) => setSelectedVenue(prev => prev ? { ...prev, address: e.target.value } : null)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="sunnySpotDescription">Sunny Spot Description</Label>
                  <Textarea
                    id="sunnySpotDescription"
                    value={selectedVenue.sunnySpotDescription || ''}
                    onChange={(e) => setSelectedVenue(prev => prev ? { ...prev, sunnySpotDescription: e.target.value } : null)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasSunnySpot"
                    checked={selectedVenue.hasSunnySpot}
                    onCheckedChange={(checked) => setSelectedVenue(prev => prev ? { ...prev, hasSunnySpot: checked } : null)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="hasSunnySpot">Has Sunny Spot</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasHeaters"
                    checked={selectedVenue.hasHeaters}
                    onCheckedChange={(checked) => setSelectedVenue(prev => prev ? { ...prev, hasHeaters: checked } : null)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="hasHeaters">Has Heaters</Label>
                </div>

                <div>
                  <Label>Image</Label>
                  <ImageUpload
                    currentImageUrl={selectedVenue.imageUrl}
                    onUpload={handleImageUpload}
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}