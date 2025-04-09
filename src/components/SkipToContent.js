import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.js';

/**
 * SkipToContent component
 * Provides an accessible way for keyboard users to bypass navigation
 * and skip directly to the main content of the page
 */
const SkipToContent = () => {
  const { isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <a
      href="#main-content"
      className={`
        fixed top-0 left-0 z-50 p-3 transform -translate-y-full focus:translate-y-0
        transition-transform duration-200 outline-none
        ${isDarkMode 
          ? 'bg-dark-primary text-coffee-accent focus:ring-2 focus:ring-coffee-medium' 
          : 'bg-white text-coffee-dark focus:ring-2 focus:ring-coffee-accent'}
        ${isFocused ? 'translate-y-0' : ''}
      `}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;