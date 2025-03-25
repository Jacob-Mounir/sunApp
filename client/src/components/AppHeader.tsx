import { useWeather, isSunnyWeather } from '@/hooks/useWeather';
import { Sun, Cloud, CloudSun, LogIn, MapPin, Menu, User } from 'lucide-react';
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
      return <Sun className="h-5 w-5 text-yellow-500" />;
    }

    if (isSunnyWeather(weather.weatherCondition, weather.icon)) {
      return <Sun className="h-5 w-5 text-yellow-500" />;
    } else if (weather.weatherCondition === 'Clouds') {
      return <CloudSun className="h-5 w-5 text-yellow-500" />;
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
    <header className="bg-white shadow-md z-10 sticky top-0 bg-gradient-to-r from-orange-50 to-amber-50">
      <div className="max-w-xl mx-auto px-4 py-3">
        {/* Top row with logo and profile */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-1.5 rounded-lg shadow-sm">
              <Sun className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">SunSpotter</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Weather Status */}
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center">
              <span className="mr-1.5 text-sm font-medium text-gray-700">
                {weather?.temperature ? `${Math.round(weather.temperature)}°C` : '--°C'}
              </span>
              {renderWeatherIcon()}
            </div>
            
            {/* User Avatar */}
            <Link href="/login" className="bg-white p-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <User className="h-5 w-5 text-gray-600" />
            </Link>
          </div>
        </div>
        
        {/* Bottom row with location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700 text-sm font-medium">
            <MapPin className="h-4 w-4 mr-1.5 text-primary" />
            <span>{formatLocation()}</span>
          </div>
          
          <button 
            className="text-gray-600 hover:text-gray-800"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
