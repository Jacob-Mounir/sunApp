import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, Bookmark, Trash2, MapPin, Sun, CloudSun, Info, 
  Home, Search, Filter, ChevronsRight, XCircle, Menu
} from 'lucide-react';
import { VenueCard } from '@/components/VenueCard';
import { Venue } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSavedVenues } from '@/hooks/useSavedVenues';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FilterState } from '@/types';

export default function SavedLocations() {
  const [, navigate] = useLocation();
  const { 
    savedVenues, 
    removeSavedVenue, 
    getSavedCount, 
    clearAllSaved,
    isInitialized
  } = useSavedVenues();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeVenueFilters, setActiveVenueFilters] = useState<FilterState>({
    all: true,
    restaurant: false,
    cafe: false,
    bar: false,
    park: false
  });
  const [showSunnyOnly, setShowSunnyOnly] = useState(false);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  
  const handleRemoveSaved = (venueId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    removeSavedVenue(venueId);
  };
  
  const handleVenueSelect = (venue: Venue) => {
    // Navigate to venue details page
    navigate(`/venue/${venue.id}`);
  };
  
  const handleFilterChange = (filter: string) => {
    if (filter === 'all') {
      setActiveVenueFilters({
        all: true,
        restaurant: false,
        cafe: false,
        bar: false,
        park: false
      });
    } else {
      setActiveVenueFilters(prev => {
        const newFilters = {
          ...prev,
          all: false,
          [filter]: !prev[filter]
        };
        
        // If no filter is active, re-enable "all"
        if (!newFilters.restaurant && !newFilters.cafe && !newFilters.bar && !newFilters.park) {
          newFilters.all = true;
        }
        
        return newFilters;
      });
    }
  };
  
  const toggleSunnyFilter = () => {
    setShowSunnyOnly(!showSunnyOnly);
  };
  
  const toggleNearbyFilter = () => {
    setShowNearbyOnly(!showNearbyOnly);
  };
  
  const filteredVenues = savedVenues.filter(venue => {
    // Text search
    const nameMatch = venue.name.toLowerCase().includes(searchTerm.toLowerCase());
    const addressMatch = venue.address.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = venue.city?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const areaMatch = venue.area?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const textMatch = nameMatch || addressMatch || cityMatch || areaMatch;
    
    if (!textMatch) return false;
    
    // Venue type filter
    if (!activeVenueFilters.all) {
      const typeMatch = (
        (activeVenueFilters.restaurant && venue.venueType === 'restaurant') ||
        (activeVenueFilters.cafe && venue.venueType === 'cafe') ||
        (activeVenueFilters.bar && venue.venueType === 'bar') ||
        (activeVenueFilters.park && venue.venueType === 'park')
      );
      if (!typeMatch) return false;
    }
    
    // Sunny filter
    if (showSunnyOnly && !venue.hasSunnySpot) {
      return false;
    }
    
    // Nearby filter - considers venues within 3km as nearby
    if (showNearbyOnly && (!venue.distance || venue.distance > 3)) {
      return false;
    }
    
    return true;
  });
  
  const toggleFilterPanel = () => {
    setIsFiltering(!isFiltering);
  };
  
  const handleClearAll = () => {
    if (getSavedCount() > 0) {
      if (window.confirm('Are you sure you want to clear all saved locations?')) {
        clearAllSaved();
      }
    } else {
      toast({
        title: "No saved locations",
        description: "You don't have any saved locations to clear",
        variant: "default",
      });
    }
  };
  
  // Navigation handler for bottom navigation
  const handleNavItemClick = (item: 'explore' | 'saved' | 'settings') => {
    if (item === 'explore') {
      navigate('/');
    } else if (item === 'saved') {
      // Already on saved page
    } else if (item === 'settings') {
      navigate('/settings');
    }
  };

  // Show loading state before initialization completes
  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Bookmark className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
          <p className="text-gray-600">Loading saved locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/")}
            className="mr-3 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Saved Locations</h1>
        </div>
        
        {getSavedCount() > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-red-500 text-sm flex items-center px-2 py-1 rounded-md hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" /> Clear All
          </button>
        )}
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
            className={`flex items-center text-sm ${isFiltering ? 'text-amber-700 font-medium' : 'text-amber-600'} hover:text-amber-700`}
            onClick={toggleFilterPanel}
          >
            <Filter className="h-4 w-4 mr-1" />
            {isFiltering ? 'Hide Filters' : 'Filter'}
          </button>
        </div>
        
        {isFiltering && (
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-medium text-amber-800 mb-3">Filter Saved Locations</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeVenueFilters.all 
                    ? 'bg-amber-100 text-amber-800 filter-button-active shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => handleFilterChange('restaurant')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeVenueFilters.restaurant 
                    ? 'bg-amber-100 text-amber-800 filter-button-active shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Restaurants
              </button>
              <button 
                onClick={() => handleFilterChange('cafe')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeVenueFilters.cafe 
                    ? 'bg-amber-100 text-amber-800 filter-button-active shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Cafés
              </button>
              <button 
                onClick={() => handleFilterChange('bar')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeVenueFilters.bar 
                    ? 'bg-amber-100 text-amber-800 filter-button-active shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Bars
              </button>
              <button 
                onClick={() => handleFilterChange('park')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeVenueFilters.park 
                    ? 'bg-amber-100 text-amber-800 filter-button-active shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Parks
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button 
                onClick={toggleSunnyFilter}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center transition-all ${
                  showSunnyOnly 
                    ? 'bg-amber-100 text-amber-800 filter-button-active shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Sun className={`h-3.5 w-3.5 mr-1.5 ${showSunnyOnly ? 'text-amber-700' : 'text-amber-500'}`} />
                Sunny spots
              </button>
              <button 
                onClick={toggleNearbyFilter}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center transition-all ${
                  showNearbyOnly 
                    ? 'bg-blue-100 text-blue-800 filter-button-active shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home className={`h-3.5 w-3.5 mr-1.5 ${showNearbyOnly ? 'text-blue-700' : 'text-blue-500'}`} />
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
            <div key={venue.id} className="relative venue-card-container">
              <VenueCard
                venue={venue}
                isSunny={venue.hasSunnySpot}
                onClick={() => handleVenueSelect(venue)}
              />
              <button 
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-150 venue-delete-button"
                onClick={(e) => handleRemoveSaved(venue.id, e)}
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
            {searchTerm || !activeVenueFilters.all || showSunnyOnly || showNearbyOnly
              ? 'No results match your current filters'
              : 'Save your favorite sunny spots to access them quickly later'}
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
      
      <BottomNavigation 
        activeItem="saved" 
        onItemClick={handleNavItemClick} 
      />
    </div>
  );
}