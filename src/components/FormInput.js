import React, { forwardRef } from 'react';
import { useTheme } from '../context/ThemeContext.js';

/**
 * FormInput component for standardized input fields with built-in styling,
 * error handling, and accessibility features.
 * 
 * @param {Object} props
 * @param {string} props.id - Input ID (required for accessibility)
 * @param {string} props.name - Input name attribute
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.label - Label for the input
 * @param {string} props.value - Current input value
 * @param {function} props.onChange - Change handler function
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.error - Error message to display
 * @param {string} props.className - Additional classes for the input
 * @param {string} props.helpText - Optional help text
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {React.ReactNode} props.leftIcon - Optional icon to show at the left of the input
 * @param {React.ReactNode} props.rightIcon - Optional icon to show at the right of the input
 */
const FormInput = forwardRef(({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  className = '',
  helpText = '',
  disabled = false,
  leftIcon,
  rightIcon,
  onBlur,
  autoComplete,
  ...rest
}, ref) => {
  const { isDarkMode } = useTheme();
  
  // Generate a unique ID if none provided
  const inputId = id || `input-${name}-${Math.random().toString(36).substring(2, 9)}`;
  const helpId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
  
  // Base classes with dark mode support
  const baseInputClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring";
  
  // Classes based on error state and theme
  const inputClasses = error
    ? `${baseInputClasses} ${isDarkMode 
        ? 'border-red-700 bg-red-900 bg-opacity-10 text-red-400 placeholder-red-700 focus:border-red-500 focus:ring-red-500' 
        : 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'}`
    : `${baseInputClasses} ${isDarkMode
        ? 'border-dark-default bg-dark-hover text-dark-primary placeholder-dark-secondary focus:border-coffee-medium focus:ring-coffee-medium'
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
          htmlFor={inputId} 
          className={labelClasses}
        >
          {label}
          {required && <span className="text-coffee-accent ml-1" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}
      
      <div className={`relative ${leftIcon || rightIcon ? 'flex items-center' : ''}`}>
        {leftIcon && (
          <div className={`absolute left-0 pl-3 flex items-center pointer-events-none ${
            isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'
          }`} aria-hidden="true">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          autoComplete={autoComplete}
          className={`
            ${inputClasses} 
            ${className} 
            ${disabled ? isDarkMode ? 'bg-dark-primary opacity-60 cursor-not-allowed' : 'bg-gray-100 cursor-not-allowed' : ''}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
          `}
          {...rest}
        />
        
        {rightIcon && (
          <div className={`absolute right-0 pr-3 flex items-center pointer-events-none ${
            isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'
          }`} aria-hidden="true">
            {rightIcon}
          </div>
        )}
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

FormInput.displayName = 'FormInput';

export default FormInput;