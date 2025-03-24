import { useQuery } from '@tanstack/react-query';
import { WeatherData } from '@/types';

export function useWeather(latitude: number, longitude: number) {
  return useQuery<WeatherData>({
    queryKey: ['/api/weather', { latitude, longitude }],
    queryFn: async () => {
      const response = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    },
    enabled: !!(latitude && longitude),
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 15, // Refresh every 15 minutes
  });
}

// Utility to determine if the current weather is sunny
export function isSunnyWeather(weatherCondition?: string, icon?: string): boolean {
  if (!weatherCondition) return false;
  
  // Check weather condition
  const sunnyConditions = ['Clear', 'Sunny'];
  const partlySunny = ['Clouds', 'Partly cloudy'];
  
  if (sunnyConditions.includes(weatherCondition)) return true;
  
  // For partly cloudy, check the icon (icons with 'd' are daytime)
  if (partlySunny.includes(weatherCondition) && icon && icon.includes('d')) {
    return true;
  }
  
  return false;
}
