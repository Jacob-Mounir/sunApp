import { useWeather, isSunnyWeather } from '@/hooks/useWeather';
import { Sun, Cloud, CloudSun, LogIn } from 'lucide-react';
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

  return (
    <header className="bg-white shadow-sm z-10 sticky top-0">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-primary text-2xl">
            <Sun />
          </span>
          <h1 className="text-xl font-bold">SunSpotter</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Weather Status */}
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium">
              {weather?.temperature ? `${Math.round(weather.temperature)}°C` : '--°C'}
            </span>
            {renderWeatherIcon()}
          </div>
          
          {/* Login Link */}
          <Link href="/login" className="text-primary hover:text-primary/80">
            <LogIn className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
