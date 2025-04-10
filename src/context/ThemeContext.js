import React, { createContext, useContext, useState, useEffect } from 'react';
import coffeeTheme from '../styles/coffeeTheme.js';

// Create theme context
const ThemeContext = createContext();

/**
 * Custom hook to access the Theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  // Provide default values if context is undefined to prevent destructuring errors
  if (!context) {
    return {
      theme: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
      isDarkMode: false,
      isLightMode: true
    };
  }
  return context;
}

/**
 * Theme Provider component
 * Manages theme settings (light/dark mode) throughout the application
 */
export function ThemeProvider({ children }) {
  // Check if user has already set a preference or get system preference
  const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'light';
    
    // Check for saved preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check if user has dark mode preference in their OS
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light theme
    return 'light';
  };
  
  const [theme, setTheme] = useState(getInitialTheme);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Set theme on body element
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const body = document.body;
    
    if (theme === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Context value
  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDarkMode: theme === 'dark',
    isLightMode: theme === 'light'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;