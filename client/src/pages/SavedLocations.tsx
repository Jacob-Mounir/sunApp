import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Bookmark, Trash2, MapPin, Sun, CloudSun, Info, Home, Search, Filter } from 'lucide-react';
import { VenueCard } from '@/components/VenueCard';
import { Venue } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSavedVenues } from '@/hooks/useSavedVenues';

export default function SavedLocations() {
  const [, navigate] = useLocation();
  const { savedVenues, removeSavedVenue } = useSavedVenues();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  
  const handleRemoveSaved = (venueId: number) => {
    removeSavedVenue(venueId);
  };
  
  const handleVenueSelect = (venue: Venue) => {
    // Navigate to venue details page
    navigate(`/venue/${venue.id}`);
  };
  
  const filteredVenues = savedVenues.filter(venue => {
    const nameMatch = venue.name.toLowerCase().includes(searchTerm.toLowerCase());
    const addressMatch = venue.address.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = venue.city?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const areaMatch = venue.area?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
    return nameMatch || addressMatch || cityMatch || areaMatch;
  });
  
  const toggleFilterPanel = () => {
    setIsFiltering(!isFiltering);
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
        <h1 className="text-2xl font-bold text-gray-900">Saved Locations</h1>
      </div>
      
      {/* Search and filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search saved locations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {filteredVenues.length} saved {filteredVenues.length === 1 ? 'location' : 'locations'}
          </div>
          <button 
            className="flex items-center text-sm text-amber-600 hover:text-amber-700"
            onClick={toggleFilterPanel}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </button>
        </div>
        
        {isFiltering && (
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-medium text-amber-800 mb-3">Filter Saved Locations</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                All
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium">
                Restaurants
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium">
                Cafés
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium">
                Bars
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium">
                Parks
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium flex items-center">
                <Sun className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Sunny spots
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium flex items-center">
                <Home className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                Nearby
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* List of saved venues */}
      {filteredVenues.length > 0 ? (
        <div className="space-y-4">
          {filteredVenues.map((venue) => (
            <div key={venue.id} className="relative">
              <VenueCard
                venue={venue}
                isSunny={venue.hasSunnySpot}
                onClick={() => handleVenueSelect(venue)}
              />
              <button 
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                onClick={() => handleRemoveSaved(venue.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4 bg-gray-50 rounded-lg">
          <div className="bg-amber-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center">
            <Bookmark className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-800">No saved locations</h3>
          <p className="text-gray-600 max-w-xs mx-auto">
            Save your favorite sunny spots to access them quickly later
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 inline-flex items-center"
            onClick={() => navigate("/")}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Explore Locations
          </button>
        </div>
      )}
    </div>
  );
}