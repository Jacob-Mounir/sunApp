import React from 'react';
import { useVenueSunshineForecast } from '@/hooks/useSunCalculation';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, SunIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SunshineForecastProps {
  venueId: number;
  className?: string;
}

export function SunshineForecast({ venueId, className }: SunshineForecastProps) {
  const [startDate, setStartDate] = React.useState<Date>(new Date());
  const [days, setDays] = React.useState(7);

  const { data: forecast, isLoading, error } = useVenueSunshineForecast(venueId, days, startDate);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
    }
  };

  // Helper function to get color based on sunshine percentage
  const getSunshineColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-br from-yellow-300 to-amber-500 text-black';
    if (percentage >= 60) return 'bg-gradient-to-br from-yellow-200 to-amber-400 text-black';
    if (percentage >= 40) return 'bg-amber-300 text-black';
    if (percentage >= 20) return 'bg-amber-200 text-black';
    return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200';
  };

  // Helper function to format time from ISO string
  const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to format minutes as hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-center text-red-500">Error loading forecast</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>Unable to load sunshine forecast data.</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl">
          Sunshine Forecast
        </CardTitle>

        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-dashed"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {forecast?.forecast.map((day, index) => (
              <div 
                key={day.date} 
                className={cn(
                  "rounded-md p-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800", 
                  index % 2 === 0 
                    ? 'bg-gray-50 dark:bg-gray-800/50' 
                    : 'bg-white dark:bg-gray-800'
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="md:w-24 font-medium">
                    {format(new Date(day.date), "EEE, MMM d")}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-1">
                      <Badge 
                        className={cn(
                          "h-7 flex-grow text-center",
                          getSunshineColor(day.sunshinePercentage)
                        )}
                      >
                        <SunIcon className="h-4 w-4 mr-1" /> 
                        {day.sunshinePercentage}% Sunshine
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="inline-block mr-4">
                        ☀️ {formatTime(day.sunriseTime)} - {formatTime(day.sunsetTime)}
                      </span>
                      <span className="inline-block">
                        ⏱️ {formatDuration(day.sunshineMinutes)} of sunshine
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:w-24 text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">Details</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Sunny Periods</h4>
                          {day.sunnyPeriods.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No sunny periods predicted</p>
                          ) : (
                            <ul className="text-sm space-y-1">
                              {day.sunnyPeriods.map((period, i) => (
                                <li key={i} className="border-l-2 border-amber-400 pl-2">
                                  {formatTime(period.start)} - {formatTime(period.end)}
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="mt-2 pt-2 border-t text-xs text-gray-500 dark:text-gray-400">
                            <div>Day length: {formatDuration(day.dayLengthMinutes)}</div>
                            <div>Sunshine: {formatDuration(day.sunshineMinutes)} ({day.sunshinePercentage}%)</div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}