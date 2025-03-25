import { cn } from '@/lib/utils';
import { Map, List } from 'lucide-react';

export type TabOption = 'map' | 'list';

interface TabSelectorProps {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="bg-white px-4 py-3 sticky top-[106px] z-10 shadow-sm">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-center bg-gray-100 p-1 rounded-xl">
          <button 
            className={cn(
              "flex-1 flex items-center justify-center py-2 px-4 text-sm font-medium rounded-lg transition-all", 
              activeTab === 'map' 
                ? "bg-white text-gray-800 shadow-sm" 
                : "text-gray-600 hover:text-gray-800"
            )}
            onClick={() => onTabChange('map')}
          >
            <Map className="h-4 w-4 mr-2" />
            Map View
          </button>
          <button 
            className={cn(
              "flex-1 flex items-center justify-center py-2 px-4 text-sm font-medium rounded-lg transition-all", 
              activeTab === 'list' 
                ? "bg-white text-gray-800 shadow-sm" 
                : "text-gray-600 hover:text-gray-800"
            )}
            onClick={() => onTabChange('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List View
          </button>
        </div>
      </div>
    </div>
  );
}
