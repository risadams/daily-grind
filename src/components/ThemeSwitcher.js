import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa/index.js';
import { useTheme } from '../context/ThemeContext.js';

/**
 * ThemeSwitcher component that allows users to toggle between light and dark mode
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 */
const ThemeSwitcher = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-coffee-medium transition-colors ${className} ${
        isDarkMode 
          ? 'bg-dark-surface text-dark-primary hover:bg-dark-hover' 
          : 'bg-coffee-light text-coffee-dark hover:bg-coffee-cream'
      }`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">
        {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
      {isDarkMode ? (
        <FaSun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <FaMoon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeSwitcher;