import { FilterState } from '@/types';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filter: string) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="bg-gray-50 px-4 py-2 sticky top-[146px] z-10">
      <div className="max-w-xl mx-auto">
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
      </div>
    </div>
  );
}
