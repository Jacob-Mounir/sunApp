import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertVenueSchema } from '@shared/schema';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Venue } from '@/types';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Extend the schema with form validation
const addVenueFormSchema = insertVenueSchema.extend({
  // Make sure latitude and longitude are provided and valid
  latitude: z.coerce.number()
    .min(-90).max(90)
    .describe('Latitude (between -90 and 90)'),
  longitude: z.coerce.number()
    .min(-180).max(180)
    .describe('Longitude (between -180 and 180)'),
});

type AddVenueFormValues = z.infer<typeof addVenueFormSchema>;

interface AddVenueFormProps {
  onSuccess?: (venue: Venue) => void;
  onCancel?: () => void;
}

export function AddVenueForm({ onSuccess, onCancel }: AddVenueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AddVenueFormValues>({
    resolver: zodResolver(addVenueFormSchema),
    defaultValues: {
      name: '',
      venueType: 'restaurant',
      address: '',
      latitude: 0,
      longitude: 0,
      hasSunnySpot: true,
    }
  });
  
  const onSubmit = async (data: AddVenueFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('/api/venues', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      const newVenue = response as unknown as Venue;
      
      // Invalidate the venues query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/venues'] });
      
      toast({
        title: 'Venue added successfully',
        description: `${newVenue.name} has been added to the database.`,
      });
      
      // Reset the form
      reset();
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess(newVenue);
      }
    } catch (error) {
      console.error('Error adding venue:', error);
      toast({
        title: 'Error adding venue',
        description: 'There was a problem adding the venue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add New Venue</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Venue Name *
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter venue name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="venueType" className="block text-sm font-medium">
              Venue Type *
            </label>
            <select
              id="venueType"
              {...register('venueType')}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Café</option>
              <option value="bar">Bar</option>
              <option value="park">Park</option>
            </select>
            {errors.venueType && (
              <p className="text-red-500 text-xs mt-1">{errors.venueType.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium">
              Address *
            </label>
            <input
              id="address"
              type="text"
              {...register('address')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter address"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="latitude" className="block text-sm font-medium">
              Latitude *
            </label>
            <input
              id="latitude"
              type="number"
              step="any"
              {...register('latitude')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 57.7089"
            />
            {errors.latitude && (
              <p className="text-red-500 text-xs mt-1">{errors.latitude.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="longitude" className="block text-sm font-medium">
              Longitude *
            </label>
            <input
              id="longitude"
              type="number"
              step="any"
              {...register('longitude')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 11.9746"
            />
            {errors.longitude && (
              <p className="text-red-500 text-xs mt-1">{errors.longitude.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium">
              City
            </label>
            <input
              id="city"
              type="text"
              {...register('city')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter city name"
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="area" className="block text-sm font-medium">
              Area/Neighborhood
            </label>
            <input
              id="area"
              type="text"
              {...register('area')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter area or neighborhood"
            />
            {errors.area && (
              <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="website" className="block text-sm font-medium">
              Website URL
            </label>
            <input
              id="website"
              type="text"
              {...register('website')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://example.com"
            />
            {errors.website && (
              <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium">
              Image URL
            </label>
            <input
              id="imageUrl"
              type="text"
              {...register('imageUrl')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageUrl && (
              <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="sunHoursStart" className="block text-sm font-medium">
              Sun Hours Start
            </label>
            <input
              id="sunHoursStart"
              type="text"
              {...register('sunHoursStart')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 10:00"
            />
            {errors.sunHoursStart && (
              <p className="text-red-500 text-xs mt-1">{errors.sunHoursStart.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="sunHoursEnd" className="block text-sm font-medium">
              Sun Hours End
            </label>
            <input
              id="sunHoursEnd"
              type="text"
              {...register('sunHoursEnd')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 16:00"
            />
            {errors.sunHoursEnd && (
              <p className="text-red-500 text-xs mt-1">{errors.sunHoursEnd.message}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="hasSunnySpot"
              type="checkbox"
              {...register('hasSunnySpot')}
              className="h-4 w-4 border rounded"
            />
            <label htmlFor="hasSunnySpot" className="ml-2 text-sm font-medium">
              Has Sunny Spot
            </label>
          </div>
          {errors.hasSunnySpot && (
            <p className="text-red-500 text-xs mt-1">{errors.hasSunnySpot.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="hasHeaters"
              type="checkbox"
              {...register('hasHeaters')}
              className="h-4 w-4 border rounded"
            />
            <label htmlFor="hasHeaters" className="ml-2 text-sm font-medium">
              Has Outdoor Heaters
            </label>
          </div>
          {errors.hasHeaters && (
            <p className="text-red-500 text-xs mt-1">{errors.hasHeaters.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="sunnySpotDescription" className="block text-sm font-medium">
            Sunny Spot Description
          </label>
          <textarea
            id="sunnySpotDescription"
            {...register('sunnySpotDescription')}
            className="w-full px-3 py-2 border rounded-md h-24"
            placeholder="Describe the sunny areas of this venue..."
          />
          {errors.sunnySpotDescription && (
            <p className="text-red-500 text-xs mt-1">{errors.sunnySpotDescription.message}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Venue'}
          </button>
        </div>
      </form>
    </div>
  );
}