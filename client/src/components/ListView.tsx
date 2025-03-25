import { Venue, WeatherData } from '@/types';
import { VenueCard } from './VenueCard';
import { isSunnyWeather } from '@/hooks/useWeather';
import { useSunPosition } from '@/hooks/useSunCalculation';

interface ListViewProps {
  venues: Venue[];
  weatherData?: WeatherData;
  onVenueSelect: (venue: Venue) => void;
}

export function ListView({ venues, weatherData, onVenueSelect }: ListViewProps) {
  // Use a default location (first venue's location or fallback to Gothenburg)
  const defaultLat = 57.70887; // Gothenburg latitude
  const defaultLng = 11.97456; // Gothenburg longitude
  
  // Get the location for sun position calculation
  const sunLat = venues.length > 0 ? venues[0].latitude : defaultLat;
  const sunLng = venues.length > 0 ? venues[0].longitude : defaultLng;
  
  // Get sun position for determining if venues are sunny
  const { data: sunPosition } = useSunPosition(sunLat, sunLng);
  
  // Determine if it's currently sunny based on weather and sun position
  const isSunnyWeatherNow = isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
  const isSunAboveHorizon = sunPosition ? sunPosition.elevation > 0 : false;
  const isCurrentlySunny = isSunnyWeatherNow && isSunAboveHorizon;
  
  // Sort venues by distance
  const sortedVenues = [...venues].sort((a, b) => 
    (a.distance || Infinity) - (b.distance || Infinity)
  );

  return (
    <div className="px-4 py-4 pb-24">
      <div className="max-w-xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Sunny Places Nearby</h2>
        
        {sortedVenues.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-600">No venues found nearby.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          sortedVenues.map(venue => (
            <VenueCard
              key={venue.id}
              venue={venue}
              isSunny={venue.hasSunnySpot && isCurrentlySunny}
              onClick={() => onVenueSelect(venue)}
            />
          ))
        )}
      </div>
    </div>
  );
}
