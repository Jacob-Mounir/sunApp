import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  modeName: string;
  filterTerminology: {
    sunny: string;
    shady: string;
    description: string;
  };
  isSunMode: boolean;
  ratingDescription: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get initial theme from localStorage or default to light
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('sunspotter-theme');
    return (savedTheme as Theme) || 'light';
  });

  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem('sunspotter-theme', theme);
    
    // Add or remove dark class from document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Determine if we're in sun mode (light theme) or shade mode (dark theme)
  const isSunMode = theme === 'light';

  // Get proper terminology based on the current theme
  const modeName = isSunMode ? 'Sun Mode' : 'Shade Mode';
  
  // Filter terminology changes based on the mode
  const filterTerminology = {
    sunny: isSunMode ? 'Sunny Now' : 'Shady Now',
    shady: isSunMode ? 'Shady Now' : 'Sunny Now',
    description: isSunMode 
      ? 'Show places currently in the sun' 
      : 'Show places currently in the shade'
  };

  // Rating description changes based on mode
  const ratingDescription = isSunMode 
    ? 'Sun Rating' 
    : 'Shade Rating (lower is better for shade)';

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      modeName, 
      filterTerminology, 
      isSunMode,
      ratingDescription
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}