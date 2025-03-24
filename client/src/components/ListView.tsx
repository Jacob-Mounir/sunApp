import { Venue, WeatherData } from '@/types';
import { VenueCard } from './VenueCard';
import { isSunnyWeather } from '@/hooks/useWeather';

interface ListViewProps {
  venues: Venue[];
  weatherData?: WeatherData;
  onVenueSelect: (venue: Venue) => void;
}

export function ListView({ venues, weatherData, onVenueSelect }: ListViewProps) {
  // Determine if it's currently sunny
  const isSunny = isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
  
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
              isSunny={venue.hasSunnySpot && isSunny}
              onClick={() => onVenueSelect(venue)}
            />
          ))
        )}
      </div>
    </div>
  );
}
