import { useState, useEffect } from 'react';
import { useLocation as useWouterLocation } from 'wouter';
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
import { useSunPosition, isVenueCurrentlySunny } from '@/hooks/useSunCalculation';
import { isSunnyWeather } from '@/hooks/useWeather';
import { Button } from '@/components/ui/button';
import { RotateCw, Plus, Sun } from 'lucide-react';
import { AddVenueModal } from '@/components/AddVenueModal';

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
    radius: 10000, // 10km radius to capture more venues in Göteborg
    venueType: getActiveVenueType(),
  });
  
  // Fetch weather data
  const { data: weatherData, isLoading: weatherLoading, refetch: refetchWeather } = useWeather(
    location.latitude,
    location.longitude
  );

  // Get current sun position
  const { data: sunPosition } = useSunPosition(
    location.latitude, 
    location.longitude
  );
  
  // Helper function to check if a venue is currently sunny based on sun calculation
  const isVenueSunny = (venue: Venue) => {
    // Basic check if venue has a sunny spot
    if (!venue.hasSunnySpot) return false;
    
    // Check if the current weather allows for sunshine
    if (!weatherData || !isSunnyWeather(weatherData.weatherCondition, weatherData.icon)) return false;
    
    // Check if the sun is above the horizon
    if (sunPosition && sunPosition.elevation <= 0) return false;
    
    // Check if current time is within sun hours (if specified)
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
    
    // If we have no specific sun hours but the weather is sunny and the sun is up,
    // assume the venue gets sun at the current time
    return true; 
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
  const handleFilterChange = (filter: string) => {
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
      const newFilters = { ...filters, all: false } as FilterState;
      // Set the new filter value 
      newFilters[filter] = !filters[filter as keyof FilterState];
      
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
  const [, navigate] = useWouterLocation();
  const handleNavItemClick = (item: 'explore' | 'saved' | 'settings') => {
    setActiveNavItem(item);
    
    // Navigate to the correct page based on selected item
    if (item === 'explore') {
      // Already on home screen
    } else if (item === 'saved') {
      navigate('/saved');
    } else if (item === 'settings') {
      navigate('/settings');
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
    <div className="flex flex-col min-h-screen page-content">
      <AppHeader 
        latitude={location.latitude}
        longitude={location.longitude} 
      />
      
      <SearchBar onSearch={handleSearch} />
      
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
        sunnyOnly={showSunnyOnly}
        heatersOnly={showHeatersOnly}
        onSunnyToggle={toggleSunnyFilter}
        onHeatersToggle={toggleHeatersFilter}
      />
      
      {/* Airbnb-style split view */}
      <main className="flex-grow relative flex flex-col md:flex-row">
        {/* Map section (always visible on large screens, top section on mobile) */}
        <div className="h-[50vh] md:h-auto md:flex-1 relative md:sticky md:top-0">
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
        
        {/* Card list section (scrollable list of venues) */}
        <div className="flex-1 overflow-auto bg-white rounded-t-3xl -mt-5 relative z-10 shadow-lg md:shadow-none md:mt-0 md:rounded-none md:max-w-md">
          <div className="sticky top-0 z-20 bg-white pt-2 pb-4 px-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-2 md:hidden"></div>
            <TabSelector 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
          </div>
          
          {activeTab === 'list' && (
            <ListView
              venues={filteredVenues}
              weatherData={weatherData}
              onVenueSelect={handleVenueSelect}
            />
          )}
          
          {activeTab === 'map' && (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">
                {filteredVenues.length} sunny spots in the area
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {filteredVenues.map(venue => (
                  <div 
                    key={venue.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleVenueSelect(venue)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{venue.name}</h3>
                        <p className="text-sm text-gray-500">{venue.venueType} · {venue.distance ? `${(venue.distance / 1000).toFixed(1)} km away` : 'Distance unavailable'}</p>
                        {venue.sunHoursStart && venue.sunHoursEnd && (
                          <p className="text-sm text-amber-600 font-medium mt-1">
                            Sunny {venue.sunHoursStart} - {venue.sunHoursEnd}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center bg-amber-50 rounded-full px-2 py-1">
                        <Sun className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-sm font-medium">{isVenueSunny(venue) ? 'Now' : 'Later'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation 
        activeItem={activeNavItem}
        onItemClick={handleNavItemClick}
      />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-4 z-10 sm:bottom-24 xs:bottom-20 flex flex-col space-y-2">
        {/* Add Venue Button */}
        <AddVenueModal>
          <Button
            className="w-12 h-12 rounded-full shadow-lg bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </AddVenueModal>
        
        {/* Refresh Button */}
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
