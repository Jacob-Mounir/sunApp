import { Search, X, Filter } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = "Search venues..."
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <div
      className="bg-white px-4 py-3 sticky top-[112px] z-10 shadow-sm"
      role="search"
      aria-label="Search venues"
    >
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className={`h-4 w-4 ${isLoading ? 'text-amber-500 animate-spin' : 'text-gray-500'}`} />
            </div>
            <input
              ref={searchInputRef}
              type="search"
              className={`block w-full p-2.5 pl-10 pr-10 text-sm rounded-full bg-gray-100 border-2 transition-all duration-200
                ${isFocused
                  ? 'border-amber-500 ring-2 ring-amber-200'
                  : 'border-transparent focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                }
                placeholder:text-gray-600`}
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              aria-label="Search input"
              aria-busy={isLoading}
              aria-controls="search-results"
              disabled={isLoading}
            />
            {searchTerm && !isLoading && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-200 rounded-full p-1 transition-colors"
                onClick={clearSearch}
                aria-label="Clear search"
                type="button"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <button
            className="flex items-center justify-center p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Open filters"
            type="button"
          >
            <Filter className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
