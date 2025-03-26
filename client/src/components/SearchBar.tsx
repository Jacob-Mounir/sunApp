import { Search, X, Filter } from 'lucide-react';
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
    <div className="bg-white px-4 py-3 sticky top-[112px] z-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input 
              type="search" 
              className="block w-full p-2.5 pl-10 pr-10 text-sm rounded-full bg-gray-100 border-transparent focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder:text-gray-600" 
              placeholder="Search venues..." 
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
          
          <button className="flex items-center justify-center p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <Filter className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
