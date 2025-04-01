import React, { useState } from 'react';
import { Link } from 'wouter';
import { MapPin, Search, SlidersHorizontal, Sun, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SunIcon } from '@/components/SunIcon';
import { useWeather, isSunnyWeather } from '@/hooks/useWeather';
import { useTheme } from '@/hooks/useTheme';
import { FilterState } from '@/types';
import { cn } from '@/lib/utils';

interface CompactHeaderProps {
  latitude: number;
  longitude: number;
  onSearch: (searchTerm: string) => void;
  filters: FilterState;
  onFilterChange: (filter: string) => void;
  sunnyOnly?: boolean;
  heatersOnly?: boolean;
  onSunnyToggle?: () => void;
  onHeatersToggle?: () => void;
}

export function CompactHeader({
  latitude,
  longitude,
  onSearch,
  filters,
  onFilterChange,
  sunnyOnly,
  heatersOnly,
  onSunnyToggle,
  onHeatersToggle
}: CompactHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: weather } = useWeather(latitude, longitude);
  const { isSunMode } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // Format current location
  const formatLocation = () => {
    return "Göteborg, Sweden";
  };

  // Get formatted date
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-SE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="bg-white shadow-sm w-full">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <SunIcon size={28} rating={80} type="sun" />
            <span className="font-bold text-xl text-amber-500">SunSpotter</span>
          </div>

          {/* Temperature and Mode Indicator */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-lg font-medium text-gray-800">
              {weather?.temperature ? `${Math.round(weather.temperature)}°` : '--°'}
            </span>
            <div className="flex items-center px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-sm">
              <Sun className="w-4 h-4 mr-1 text-amber-500" />
              <span>Sun Mode</span>
            </div>
          </div>

          {/* Login Button */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700">
                <User className="w-5 h-5 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Location and Search Bar */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Left Section: Location */}
            <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="font-medium">{formatLocation()}</span>
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Right Section: Search */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative min-w-[240px]">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search venues..."
                    className="pl-10 pr-4 py-2 rounded-full border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </form>
              </div>
              <button className="p-2 rounded-full border border-gray-200">
                <SlidersHorizontal className="w-5 h-5 text-gray-700" />
              </button>
              <span className="hidden md:block text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                {getFormattedDate()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-3">
            <div className="flex space-x-2">
              <CategoryButton
                active={filters.all}
                onClick={() => onFilterChange('all')}
                icon={<MapPin className="w-4 h-4" />}
                label="All"
              />
              <CategoryButton
                active={filters.restaurant}
                onClick={() => onFilterChange('restaurant')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3v18m5-18v3a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-3h10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>}
                label="Restaurants"
              />
              <CategoryButton
                active={filters.cafe}
                onClick={() => onFilterChange('cafe')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 1v3M10 1v3M14 1v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>}
                label="Cafes"
              />
              <CategoryButton
                active={filters.bar}
                onClick={() => onFilterChange('bar')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 22h8M12 11v11M6.5 3.5c-.5-1.8.4-2.5 2.5-2.5h6c2.1 0 3 .7 2.5 2.5L15 11H9L6.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>}
                label="Bars"
              />
              <CategoryButton
                active={filters.park}
                onClick={() => onFilterChange('park')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22v-7M9 9h6M9 17h6M8 5a3 3 0 0 1 4-3 3 3 0 0 1 4 3 3 3 0 0 1-4 3 3 3 0 0 1-4-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 22a5 5 0 0 1-5-5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2 5 5 0 0 1-5 5h-10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>}
                label="Parks"
              />
            </div>

            <div className="flex space-x-2">
              <FilterButton
                active={sunnyOnly}
                onClick={onSunnyToggle}
                icon={<Sun className="w-4 h-4" />}
                label="Sunny Now"
              />
              <FilterButton
                active={heatersOnly}
                onClick={onHeatersToggle}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22v-8M8 14v8M16 14v8M8 6V2M12 6V2M16 6V2M4 10h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>}
                label="With Heaters"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function CategoryButton({ active, onClick, icon, label }: CategoryButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
        active
          ? "bg-amber-100 text-amber-600 border border-amber-200"
          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "text-inherit",
        active ? "text-amber-500" : "text-gray-500"
      )}>
        {icon}
      </div>
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}

interface FilterButtonProps {
  active?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
}

function FilterButton({ active, onClick, icon, label }: FilterButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border",
        active
          ? "bg-amber-50 text-amber-600 border-amber-200"
          : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "text-inherit",
        active ? "text-amber-500" : "text-gray-500"
      )}>
        {icon}
      </div>
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}