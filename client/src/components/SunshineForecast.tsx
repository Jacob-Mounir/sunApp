import React from 'react';
import { useVenueSunshineForecast } from '@/hooks/useSunCalculation';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SunIcon } from '@/components/SunIcon';

interface SunshineForecastProps {
  venueId: number;
  className?: string;
}

export const SunshineForecast: React.FC<SunshineForecastProps> = ({ venueId, className }) => {
  const [date, setDate] = React.useState<Date>(new Date());
  const { data: forecast, isLoading } = useVenueSunshineForecast(venueId, date);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!forecast) {
    return null;
  }

  const getSunIcon = (percentage: number, type: 'sunrise' | 'sunset' | 'sun' = 'sun') => {
    return (
      <SunIcon
        rating={percentage}
        type={type}
        size={type === 'sun' ? 24 : 20}
        showRating={type === 'sun'}
      />
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Sunshine Forecast
        </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
      </CardHeader>
      <CardContent>
          <div className="space-y-4">
          {forecast.forecast.map((day) => (
            <div key={day.date} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getSunIcon(day.sunshinePercentage)}
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {format(new Date(day.date), 'EEEE, MMM d')}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {getSunIcon(100, 'sunrise')}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(day.sunriseTime), 'h:mm a')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">|</span>
                    <div className="flex items-center space-x-1">
                      {getSunIcon(100, 'sunset')}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(day.sunsetTime), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant={day.sunshinePercentage > 60 ? "default" : "secondary"}>
                {Math.round(day.sunshineMinutes / 60)}h {day.sunshineMinutes % 60}m
              </Badge>
              </div>
            ))}
          </div>
      </CardContent>
    </Card>
  );
};