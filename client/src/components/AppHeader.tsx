import { useWeather, isSunnyWeather } from '@/hooks/useWeather';
import { Sun, Cloud, CloudSun, MapPin, ChevronDown } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useState, useRef } from 'react';

interface AppHeaderProps {
  latitude: number;
  longitude: number;
}

export function AppHeader({ latitude, longitude }: AppHeaderProps) {
  const { data: weather, isLoading } = useWeather(latitude, longitude);
  const [scrollY, setScrollY] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate the compressed state based on scroll position
  const isCompressed = scrollY > 20;
  
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
    <header ref={headerRef} className="bg-white dark:bg-gray-800 shadow-sm z-30 sticky top-0 transition-all duration-300">
      <div className="max-w-xl mx-auto px-4 py-2">
        {/* Main row with logo and weather */}
        <div className="flex items-center justify-between">
          {/* Logo and location combined in one row when compressed */}
          <div className={`flex items-center gap-x-3 transition-all duration-300 ${isCompressed ? 'gap-x-4' : ''}`}>
            <h1 
              className={`font-extrabold text-amber-500 tracking-tight transition-all duration-300 ${
                isCompressed ? 'text-lg scale-75 origin-left' : 'text-xl'
              }`}
            >
              SunSpotter
            </h1>
            
            {/* Location selector - moved next to logo when scrolled */}
            {isCompressed && (
              <button className="flex items-center text-gray-900 dark:text-gray-100 font-medium text-sm">
                <MapPin className="h-3 w-3 mr-1 text-amber-500" />
                <span className="text-xs truncate max-w-[120px]">{formatLocation()}</span>
                <ChevronDown className="h-3 w-3 ml-1 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Weather & Status */}
          <div className="flex items-center space-x-4">
            {/* Weather Status */}
            <div className="flex items-center">
              {renderWeatherIcon()}
              <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                {weather?.temperature ? `${Math.round(weather.temperature)}°` : '--°'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Location selector (visible only when not compressed) */}
        {!isCompressed && (
          <div className="mt-3 flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <button className="flex items-center text-gray-900 dark:text-gray-100 font-medium text-sm">
              <MapPin className="h-4 w-4 mr-2 text-amber-500" />
              <span>{formatLocation()}</span>
              <ChevronDown className="h-4 w-4 ml-1 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* Current date */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-SE', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
