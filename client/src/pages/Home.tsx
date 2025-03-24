import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { SearchBar } from '@/components/SearchBar';
import { TabSelector, TabOption } from '@/components/TabSelector';
import { FilterBar } from '@/components/FilterBar';
import { MapView } from '@/components/MapView';
import { ListView } from '@/components/ListView';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FilterState, Venue } from '@/types';
import { useLocation } from '@/hooks/useLocation';
import { useVenues } from '@/hooks/useVenues';
import { useWeather } from '@/hooks/useWeather';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

export default function Home() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabOption>('map');
  
  // Navigation state
  const [activeNavItem, setActiveNavItem] = useState<'explore' | 'saved' | 'settings'>('explore');
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    all: true,
    restaurant: false,
    cafe: false,
    bar: false,
    park: false,
  });
  
  // Special filters
  const [showSunnyOnly, setShowSunnyOnly] = useState(false);
  const [showHeatersOnly, setShowHeatersOnly] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected venue state
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Get user location
  const location = useLocation();
  
  // Fetch venues near user location
  const { data: venues = [], isLoading: venuesLoading, refetch: refetchVenues } = useVenues({
    latitude: location.latitude,
    longitude: location.longitude,
    radius: 5000, // 5km radius
    venueType: getActiveVenueType(),
  });
  
  // Fetch weather data
  const { data: weatherData, isLoading: weatherLoading, refetch: refetchWeather } = useWeather(
    location.latitude,
    location.longitude
  );

  // Helper function to check if a venue is currently sunny based on time and weather
  const isVenueSunny = (venue: Venue) => {
    if (!venue.hasSunnySpot) return false;
    if (!weatherData) return true; // Default to true if no weather data
    
    // Check if the current weather is sunny
    const isSunny = weatherData.weatherCondition?.toLowerCase().includes('clear') || 
                    weatherData.weatherCondition?.toLowerCase().includes('sun');
    
    if (!isSunny) return false;
    
    // Check if current time is within sun hours
    if (venue.sunHoursStart && venue.sunHoursEnd) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour + currentMinute / 60;
      
      const [startHour, startMinute] = venue.sunHoursStart.split(':').map(Number);
      const [endHour, endMinute] = venue.sunHoursEnd.split(':').map(Number);
      
      const startTime = startHour + startMinute / 60;
      const endTime = endHour + endMinute / 60;
      
      return currentTime >= startTime && currentTime <= endTime;
    }
    
    return true; // Default to true if no sun hours specified
  };
  
  // Filter venues based on search term, filters, and special conditions
  const filteredVenues = venues.filter(venue => {
    // Filter by search term
    if (searchTerm && !venue.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by venue type
    if (!filters.all && venue.venueType && !(venue.venueType in filters) || !filters[venue.venueType as keyof FilterState]) {
      return false;
    }
    
    // Filter by sunny spots
    if (showSunnyOnly && !isVenueSunny(venue)) {
      return false;
    }
    
    // Filter by heaters
    if (showHeatersOnly && !venue.hasHeaters) {
      return false;
    }
    
    return true;
  });

  // Handle filter changes
  const handleFilterChange = (filter: keyof FilterState) => {
    if (filter === 'all') {
      // If "all" is clicked, make only "all" active
      setFilters({
        all: true,
        restaurant: false,
        cafe: false,
        bar: false,
        park: false,
      });
    } else {
      // If a specific filter is clicked
      const newFilters = { ...filters, all: false };
      newFilters[filter] = !filters[filter];
      
      // If no filters are active, make "all" active
      const anyActive = Object.entries(newFilters).some(
        ([key, value]) => key !== 'all' && value === true
      );
      
      if (!anyActive) {
        newFilters.all = true;
      }
      
      setFilters(newFilters);
    }
  };

  // Toggle special filters
  const toggleSunnyFilter = () => setShowSunnyOnly(!showSunnyOnly);
  const toggleHeatersFilter = () => setShowHeatersOnly(!showHeatersOnly);

  // Get active venue type for API query
  function getActiveVenueType(): string | undefined {
    if (filters.all) return undefined;
    
    const activeFilters = Object.entries(filters)
      .filter(([key, value]) => key !== 'all' && value === true)
      .map(([key]) => key);
    
    if (activeFilters.length === 1) {
      return activeFilters[0];
    }
    
    return undefined;
  }

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle venue selection
  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    
    // Switch to map view if in list view
    if (activeTab === 'list') {
      setActiveTab('map');
    }
  };

  // Handle bottom navigation item click
  const handleNavItemClick = (item: 'explore' | 'saved' | 'settings') => {
    setActiveNavItem(item);
    
    // For now, just switch to the correct tab
    // In a full app, we would navigate to different screens
    if (item === 'explore') {
      // Already on home screen
    } else if (item === 'saved') {
      alert('Saved places feature not implemented yet.');
    } else if (item === 'settings') {
      alert('Settings feature not implemented yet.');
    }
  };

  // Refresh data
  const handleRefresh = () => {
    // Refresh location, venues, and weather
    location.refreshLocation();
    refetchVenues();
    refetchWeather();
  };

  // Update venue type filter when activeFilters change
  useEffect(() => {
    refetchVenues();
  }, [filters, refetchVenues]);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader 
        latitude={location.latitude}
        longitude={location.longitude} 
      />
      
      <SearchBar onSearch={handleSearch} />
      
      <TabSelector 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      <main className="flex-grow relative pb-16">
        {/* Map View */}
        <div className={activeTab === 'map' ? 'block h-full' : 'hidden'}>
          <MapView
            venues={filteredVenues}
            userLocation={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            weatherData={weatherData}
            onVenueSelect={handleVenueSelect}
          />
        </div>
        
        {/* List View */}
        <div className={activeTab === 'list' ? 'block' : 'hidden'}>
          <ListView
            venues={filteredVenues}
            weatherData={weatherData}
            onVenueSelect={handleVenueSelect}
          />
        </div>
      </main>
      
      <BottomNavigation 
        activeItem={activeNavItem}
        onItemClick={handleNavItemClick}
      />
      
      {/* Floating Action Button for refreshing */}
      <div className="fixed bottom-24 right-4 z-10">
        <Button
          className="w-12 h-12 rounded-full shadow-lg"
          onClick={handleRefresh}
        >
          <RotateCw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
