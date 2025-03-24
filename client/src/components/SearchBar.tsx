import { Search } from 'lucide-react';
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

  return (
    <div className="bg-white border-b px-4 py-2 sticky top-14 z-10">
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="search" 
            className="block w-full p-3 pl-10 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary" 
            placeholder="Search for sunny spots..." 
            value={searchTerm}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
