'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available color schemes
export type ColorScheme = 'light' | 'dark' | 'blue' | 'purple' | 'green' | 'pink';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isDark: boolean;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  setColorScheme: () => {},
  isDark: false,
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Color scheme configurations
const colorSchemeConfig = {
  light: {
    primary: 'rgb(59, 130, 246)', // blue-500
    secondary: 'rgb(99, 102, 241)', // indigo-500
    background: 'rgb(255, 255, 255)', // white
    text: 'rgb(17, 24, 39)', // gray-900
    accent: 'rgb(79, 70, 229)', // indigo-600
    isDark: false,
  },
  dark: {
    primary: 'rgb(96, 165, 250)', // blue-400
    secondary: 'rgb(129, 140, 248)', // indigo-400
    background: 'rgb(31, 41, 55)', // gray-800
    text: 'rgb(243, 244, 246)', // gray-100
    accent: 'rgb(129, 140, 248)', // indigo-400
    isDark: true,
  },
  blue: {
    primary: 'rgb(59, 130, 246)', // blue-500
    secondary: 'rgb(37, 99, 235)', // blue-600
    background: 'rgb(239, 246, 255)', // blue-50
    text: 'rgb(30, 58, 138)', // blue-900
    accent: 'rgb(29, 78, 216)', // blue-700
    isDark: false,
  },
  purple: {
    primary: 'rgb(139, 92, 246)', // purple-500
    secondary: 'rgb(124, 58, 237)', // purple-600
    background: 'rgb(245, 243, 255)', // purple-50
    text: 'rgb(76, 29, 149)', // purple-900
    accent: 'rgb(109, 40, 217)', // purple-700
    isDark: false,
  },
  green: {
    primary: 'rgb(34, 197, 94)', // green-500
    secondary: 'rgb(22, 163, 74)', // green-600
    background: 'rgb(240, 253, 244)', // green-50
    text: 'rgb(20, 83, 45)', // green-900
    accent: 'rgb(21, 128, 61)', // green-700
    isDark: false,
  },
  pink: {
    primary: 'rgb(236, 72, 153)', // pink-500
    secondary: 'rgb(219, 39, 119)', // pink-600
    background: 'rgb(253, 242, 248)', // pink-50
    text: 'rgb(131, 24, 67)', // pink-900
    accent: 'rgb(190, 24, 93)', // pink-700
    isDark: false,
  },
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize state from localStorage or default to 'light'
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [mounted, setMounted] = useState(false);

  // Effect to load saved theme from localStorage
  useEffect(() => {
    const savedScheme = localStorage.getItem('colorScheme') as ColorScheme | null;
    if (savedScheme && Object.keys(colorSchemeConfig).includes(savedScheme)) {
      setColorScheme(savedScheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use dark mode if user prefers dark mode and no saved preference
      setColorScheme('dark');
    }
    setMounted(true);
  }, []);

  // Effect to save theme to localStorage and apply CSS variables
  useEffect(() => {
    if (!mounted) return;

    // Save to localStorage
    localStorage.setItem('colorScheme', colorScheme);

    // Apply color scheme
    const config = colorSchemeConfig[colorScheme];
    
    // Set CSS variables
    document.documentElement.style.setProperty('--color-primary', config.primary);
    document.documentElement.style.setProperty('--color-secondary', config.secondary);
    document.documentElement.style.setProperty('--color-background', config.background);
    document.documentElement.style.setProperty('--color-text', config.text);
    document.documentElement.style.setProperty('--color-accent', config.accent);
    
    // Toggle dark mode class
    if (config.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorScheme, mounted]);

  // Avoid rendering with incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        colorScheme, 
        setColorScheme, 
        isDark: colorSchemeConfig[colorScheme].isDark 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
