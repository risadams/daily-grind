import React from 'react';

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
 */
const FormInput = ({
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
  ...rest
}) => {
  // Generate a unique ID if none provided
  const inputId = id || `input-${name}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base classes
  const baseInputClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring";
  
  // Classes based on error state
  const inputClasses = error
    ? `${baseInputClasses} border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500`
    : `${baseInputClasses} border-coffee-cream focus:border-coffee-medium focus:ring-coffee-light focus:ring-opacity-50`;
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-coffee-dark mb-1"
        >
          {label}
          {required && <span className="text-coffee-accent ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        className={`${inputClasses} ${className} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        {...rest}
      />
      
      {helpText && !error && (
        <p id={`${inputId}-help`} className="mt-1 text-xs text-coffee-medium">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;