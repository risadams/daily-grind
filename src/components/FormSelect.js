import React, { forwardRef } from 'react';
import { useTheme } from '../context/ThemeContext.js';

/**
 * FormSelect component for standardized select dropdowns with built-in styling,
 * error handling, and accessibility features.
 * 
 * @param {Object} props
 * @param {string} props.id - Select ID (required for accessibility)
 * @param {string} props.name - Select name attribute
 * @param {string} props.label - Label for the select
 * @param {string|number} props.value - Current selected value
 * @param {function} props.onChange - Change handler function
 * @param {Array} props.options - Array of option objects { value, label }
 * @param {string} props.placeholder - Optional placeholder text for empty option
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.error - Error message to display
 * @param {string} props.className - Additional classes for the select
 * @param {string} props.helpText - Optional help text
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {boolean} props.showEmptyOption - Whether to show an empty first option
 * @param {function} props.onBlur - Blur event handler
 */
const FormSelect = forwardRef(({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error = '',
  className = '',
  helpText = '',
  disabled = false,
  showEmptyOption = true,
  onBlur,
  ...rest
}, ref) => {
  const { isDarkMode } = useTheme();
  
  // Generate a unique ID if none provided
  const selectId = id || `select-${name}-${Math.random().toString(36).substring(2, 9)}`;
  const helpId = helpText ? `${selectId}-help` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
  
  // Base classes with dark mode support
  const baseSelectClasses = "block w-full px-3 py-2 border rounded-md appearance-none focus:outline-none focus:ring";
  
  // Classes based on error state and theme
  const selectClasses = error
    ? `${baseSelectClasses} ${isDarkMode 
        ? 'border-red-700 bg-red-900 bg-opacity-10 text-red-400 focus:border-red-500 focus:ring-red-500' 
        : 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'}`
    : `${baseSelectClasses} ${isDarkMode
        ? 'border-dark-default bg-dark-hover text-dark-primary focus:border-coffee-medium focus:ring-coffee-medium'
        : 'border-coffee-cream text-coffee-dark focus:border-coffee-medium focus:ring-coffee-light focus:ring-opacity-50'}`;
  
  // Label classes based on theme
  const labelClasses = `block text-sm font-medium ${
    isDarkMode ? 'text-dark-primary' : 'text-coffee-dark'
  } mb-1`;
  
  // Help text classes based on theme
  const helpTextClasses = `mt-1 text-xs ${
    isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'
  }`;
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={selectId} 
          className={labelClasses}
        >
          {label}
          {required && <span className="text-coffee-accent ml-1" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${selectClasses} ${className} ${
            disabled ? isDarkMode 
              ? 'bg-dark-primary opacity-60 cursor-not-allowed' 
              : 'bg-gray-100 cursor-not-allowed'
            : ''
          }`}
          {...rest}
        >
          {showEmptyOption && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div 
          className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
            isDarkMode ? 'text-dark-secondary' : 'text-gray-700'
          }`}
          aria-hidden="true"
        >
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      
      {helpText && !error && (
        <p id={helpId} className={helpTextClasses}>
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className={`mt-1 text-xs ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;