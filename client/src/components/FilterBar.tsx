import { FilterState } from '@/types';
import { cn } from '@/lib/utils';
import { Sun, Flame } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filter: string) => void;
  sunnyOnly?: boolean;
  heatersOnly?: boolean;
  onSunnyToggle?: () => void;
  onHeatersToggle?: () => void;
}

export function FilterBar({ 
  filters, 
  onFilterChange, 
  sunnyOnly = false, 
  heatersOnly = false, 
  onSunnyToggle, 
  onHeatersToggle 
}: FilterBarProps) {
  return (
    <div className="bg-gray-50 px-4 py-2 sticky top-[146px] z-10">
      <div className="max-w-xl mx-auto">
        {/* Venue type filters */}
        <div className="flex space-x-2 overflow-x-auto py-1 scrollbar-hide">
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-full whitespace-nowrap font-medium shadow-sm",
              filters.all 
                ? "bg-primary text-white" 
                : "bg-white text-gray-600 border border-gray-200"
            )}
            onClick={() => onFilterChange('all')}
          >
            All Places
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-full whitespace-nowrap font-medium shadow-sm",
              filters.restaurant 
                ? "bg-primary text-white" 
                : "bg-white text-gray-600 border border-gray-200"
            )}
            onClick={() => onFilterChange('restaurant')}
          >
            Restaurants
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-full whitespace-nowrap font-medium shadow-sm",
              filters.cafe 
                ? "bg-primary text-white" 
                : "bg-white text-gray-600 border border-gray-200"
            )}
            onClick={() => onFilterChange('cafe')}
          >
            Cafés
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-full whitespace-nowrap font-medium shadow-sm",
              filters.bar 
                ? "bg-primary text-white" 
                : "bg-white text-gray-600 border border-gray-200"
            )}
            onClick={() => onFilterChange('bar')}
          >
            Bars
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-full whitespace-nowrap font-medium shadow-sm",
              filters.park 
                ? "bg-primary text-white" 
                : "bg-white text-gray-600 border border-gray-200"
            )}
            onClick={() => onFilterChange('park')}
          >
            Parks
          </button>
        </div>
        
        {/* Special feature filters */}
        {(onSunnyToggle || onHeatersToggle) && (
          <div className="flex space-x-2 mt-2 pb-1">
            {onSunnyToggle && (
              <button 
                className={cn(
                  "px-3 py-1 text-sm rounded-full whitespace-nowrap font-medium shadow-sm flex items-center gap-1.5",
                  sunnyOnly
                    ? "bg-amber-500 text-white" 
                    : "bg-white text-gray-600 border border-gray-200"
                )}
                onClick={onSunnyToggle}
              >
                <Sun size={14} className={sunnyOnly ? "text-white" : "text-amber-500"} />
                Sunny Now
              </button>
            )}
            
            {onHeatersToggle && (
              <button 
                className={cn(
                  "px-3 py-1 text-sm rounded-full whitespace-nowrap font-medium shadow-sm flex items-center gap-1.5",
                  heatersOnly
                    ? "bg-red-500 text-white" 
                    : "bg-white text-gray-600 border border-gray-200"
                )}
                onClick={onHeatersToggle}
              >
                <Flame size={14} className={heatersOnly ? "text-white" : "text-red-500"} />
                With Heaters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
