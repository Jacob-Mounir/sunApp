import { useWeather, isSunnyWeather } from '@/hooks/useWeather';
import { Sun, Cloud, CloudSun, MapPin, ChevronDown } from 'lucide-react';
import { Link } from 'wouter';

interface AppHeaderProps {
  latitude: number;
  longitude: number;
}

export function AppHeader({ latitude, longitude }: AppHeaderProps) {
  const { data: weather, isLoading } = useWeather(latitude, longitude);

  // Determine weather icon
  const renderWeatherIcon = () => {
    if (isLoading || !weather?.weatherCondition) {
      return <Sun className="h-5 w-5 text-amber-500" />;
    }

    if (isSunnyWeather(weather.weatherCondition, weather.icon)) {
      return <Sun className="h-5 w-5 text-amber-500" />;
    } else if (weather.weatherCondition === 'Clouds') {
      return <CloudSun className="h-5 w-5 text-amber-500" />;
    } else {
      return <Cloud className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format current location
  const formatLocation = () => {
    // This would ideally be replaced with a geocoding service to get the actual location name
    return "Göteborg, Sweden";
  };

  return (
    <header className="bg-white shadow-sm z-10 sticky top-0">
      <div className="max-w-xl mx-auto px-4 py-4">
        {/* Main row with logo and weather */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-extrabold text-amber-500 tracking-tight">SunSpotter</h1>
          </div>
          
          {/* Weather & Status */}
          <div className="flex items-center space-x-4">
            {/* Weather Status */}
            <div className="flex items-center">
              {renderWeatherIcon()}
              <span className="ml-1 text-sm font-medium text-gray-700">
                {weather?.temperature ? `${Math.round(weather.temperature)}°` : '--°'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Location selector (like Uber Eats location bar) */}
        <div className="mt-3 flex items-center justify-between py-2 border-b border-gray-100">
          <button className="flex items-center text-gray-900 font-medium text-sm">
            <MapPin className="h-4 w-4 mr-2 text-amber-500" />
            <span>{formatLocation()}</span>
            <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
          </button>
          
          {/* Current date */}
          <div className="text-xs text-gray-500">
            {new Date().toLocaleDateString('en-SE', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
