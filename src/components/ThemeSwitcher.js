import React, { useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa/index.js';
import { useTheme } from '../context/ThemeContext.js';

/**
 * ThemeSwitcher component that allows users to toggle between light and dark mode
 * Enhanced with accessibility features including keyboard shortcuts and ARIA attributes
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant (default, sm)
 * @param {string} props.id - Optional ID for the button
 */
const ThemeSwitcher = ({ className = '', size = 'default', id }) => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  
  // Generate unique ID if not provided
  const switcherId = id || `theme-switcher-${Math.random().toString(36).substring(2, 9)}`;
  
  // Icon sizes based on component size
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  
  // Handle keyboard shortcut (Alt+T) for toggling theme
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+T to toggle theme
      if (e.altKey && e.key === 't') {
        toggleTheme();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleTheme]);
  
  return (
    <button
      id={switcherId}
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-md p-2 
        transition-colors duration-200 
        ${size === 'sm' ? 'p-1.5' : 'p-2'}
        ${className} ${
        isDarkMode 
          ? 'bg-dark-surface text-dark-primary hover:bg-dark-hover focus:ring-coffee-medium' 
          : 'bg-coffee-light text-coffee-dark hover:bg-coffee-cream focus:ring-coffee-dark'
      }
        focus:outline-none focus:ring-2 focus:ring-opacity-60`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDarkMode}
      aria-live="polite"
      title={isDarkMode ? 'Switch to light mode (Alt+T)' : 'Switch to dark mode (Alt+T)'}
    >
      <span className="sr-only">
        {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} (Alt+T)
      </span>
      {isDarkMode ? (
        <FaSun className={iconSize} aria-hidden="true" />
      ) : (
        <FaMoon className={iconSize} aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeSwitcher;