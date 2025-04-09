import React, { forwardRef } from 'react';
import { useTheme } from '../context/ThemeContext.js';

/**
 * Reusable Button component with coffee-themed styling
 * Enhanced with accessibility features and dark mode support
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler function
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.variant - Visual style variant
 * @param {string} props.size - Button size
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.fullWidth - Whether the button takes full width
 * @param {React.ReactNode} props.icon - Optional icon to display
 * @param {string} props.ariaLabel - Accessible label for screen readers
 * @param {boolean} props.isLoading - Whether the button is in loading state
 */
const Button = forwardRef(({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  fullWidth = false,
  icon = null,
  ariaLabel,
  isLoading = false,
  ...rest
}, ref) => {
  const { isDarkMode } = useTheme();
  
  // Determine the appropriate variant classes based on theme
  const getVariantClasses = (variant) => {
    if (isDarkMode) {
      // Dark mode variants
      switch(variant) {
        case 'primary':
          return 'bg-coffee-medium hover:bg-coffee-primary text-white shadow-lg shadow-coffee-dark/20 hover:shadow-coffee-dark/40';
        case 'secondary':
          return 'bg-dark-hover hover:bg-dark-surface text-dark-primary border border-coffee-medium hover:border-coffee-primary shadow-lg shadow-coffee-dark/10';
        case 'outline':
          return 'bg-transparent hover:bg-dark-hover text-dark-primary border border-dark-default hover:border-coffee-medium';
        case 'danger':
          return 'bg-red-800 hover:bg-red-700 text-white';
        case 'text':
          return 'bg-transparent text-dark-primary hover:text-coffee-primary underline';
        default:
          return 'bg-dark-hover hover:bg-dark-surface text-dark-primary';
      }
    } else {
      // Light mode variants (original)
      switch(variant) {
        case 'primary':
          return 'bg-coffee-dark hover:bg-coffee-espresso text-white shadow-coffee hover:shadow-coffee-hover';
        case 'secondary':
          return 'bg-coffee-cream hover:bg-coffee-medium text-coffee-espresso hover:text-white shadow-coffee hover:shadow-coffee-hover';
        case 'outline':
          return 'bg-transparent hover:bg-coffee-light text-coffee-dark border border-coffee-medium';
        case 'danger':
          return 'bg-coffee-accent hover:bg-red-700 text-white';
        case 'text':
          return 'bg-transparent text-coffee-dark hover:text-coffee-accent underline';
        default:
          return 'bg-coffee-cream hover:bg-coffee-medium text-coffee-dark';
      }
    }
  };

  // Size styles
  const sizeClasses = {
    small: 'py-1 px-3 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg'
  };

  // Width style
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Focus ring style based on theme
  const focusRingClass = isDarkMode
    ? 'focus:outline-none focus:ring-2 focus:ring-coffee-medium focus:ring-opacity-70'
    : 'focus:outline-none focus:ring-2 focus:ring-coffee-medium focus:ring-opacity-50';
    
  // Loading spinner
  const loadingSpinner = (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel || undefined}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`
        ${getVariantClasses(variant)} 
        ${sizeClasses[size]} 
        ${widthClass}
        rounded-md font-medium transition-all duration-200 ease-in-out
        ${focusRingClass}
        ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...rest}
    >
      <div className="flex items-center justify-center">
        {isLoading && loadingSpinner}
        {!isLoading && icon && <span className="mr-2" aria-hidden="true">{icon}</span>}
        <span>{children}</span>
      </div>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;