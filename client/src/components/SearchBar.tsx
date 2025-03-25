import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="bg-white shadow-sm px-4 py-2 sticky top-[76px] z-10">
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-orange-500" />
          </div>
          <input 
            type="search" 
            className="block w-full p-3 pl-10 pr-10 text-sm rounded-xl bg-orange-50 border-transparent focus:ring-2 focus:ring-orange-400 focus:border-orange-300 placeholder:text-gray-500" 
            placeholder="Search for sunny locations..." 
            value={searchTerm}
            onChange={handleChange}
          />
          {searchTerm && (
            <button 
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
