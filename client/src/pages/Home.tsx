import { useState, useEffect } from 'react';
import { useLocation as useWouterLocation } from 'wouter';
import { AppHeader } from '@/components/AppHeader';
import { CompactHeader } from '@/components/CompactHeader';
import { TabSelector, TabOption } from '@/components/TabSelector';
import { AirbnbMapView } from '@/components/AirbnbMapView';
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
    if (!filters.all && venue.venueType &&
        (!(venue.venueType in filters) || !filters[venue.venueType as keyof FilterState])) {
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

    // Log venue selection for debugging
    console.log('Venue selected in Home component:', venue.name, venue.id);

    // Navigate to the venue details page
    navigate(`/venue/${venue.id}`);
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

  // Add venue modal state
  const [showAddVenueModal, setShowAddVenueModal] = useState(false);

  // Handle add venue
  const handleAddVenue = (venue: Venue) => {
    // Implementation of adding a venue
    console.log('Adding venue:', venue);
    setShowAddVenueModal(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Use the new CompactHeader instead of AppHeader, SearchBar, FilterBar */}
      <CompactHeader
        latitude={location.latitude}
        longitude={location.longitude}
        onSearch={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        sunnyOnly={showSunnyOnly}
        heatersOnly={showHeatersOnly}
        onSunnyToggle={toggleSunnyFilter}
        onHeatersToggle={toggleHeatersFilter}
      />

      {/* Content Area */}
      <div className="flex-1 relative">
        {/* Map or List View depending on active tab */}
        {activeTab === 'map' ? (
          <div className="h-full">
            <AirbnbMapView
              venues={filteredVenues}
              userLocation={location}
              weatherData={weatherData}
              onVenueSelect={handleVenueSelect}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto pb-24 pt-4">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-bold mb-4">Sunny Places Nearby</h2>
              <ListView
                venues={filteredVenues}
                weatherData={weatherData}
                onVenueSelect={handleVenueSelect}
              />
            </div>
          </div>
        )}

        {/* Tab Selector at the Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-10 bg-white rounded-full shadow-md h-10 w-10"
          onClick={() => {
            refetchVenues();
            refetchWeather();
          }}
        >
          <RotateCw className="h-5 w-5" />
        </Button>

        {/* Add Venue Button */}
        <Button
          className="absolute bottom-20 right-4 z-10 rounded-full shadow-md"
          onClick={() => setShowAddVenueModal(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Venue
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeItem={activeNavItem}
        onItemClick={handleNavItemClick}
      />

      {/* Add Venue Modal */}
      <AddVenueModal
        onVenueAdded={handleAddVenue}
      />
    </div>
  );
}
