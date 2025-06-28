import React, { createContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Get initial theme from localStorage or default to light
  useEffect(() => {
    const getInitialTheme = (): Theme => {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
      }
      return 'light'; // Always default to light
    };

    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    setIsInitialized(true);
  }, []);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    // Temporarily disable transitions to prevent flash
    document.documentElement.classList.add('theme-transition-disabled');

    // Apply theme attribute
    document.documentElement.setAttribute('data-theme', theme);

    // Save to localStorage
    localStorage.setItem('theme', theme);

    // Re-enable transitions after a brief delay
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition-disabled');
    }, 50);
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Export the context for use in the hook
export { ThemeContext };
