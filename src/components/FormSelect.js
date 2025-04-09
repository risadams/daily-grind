import React from 'react';

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
 */
const FormSelect = ({
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
  ...rest
}) => {
  // Generate a unique ID if none provided
  const selectId = id || `select-${name}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base classes
  const baseSelectClasses = "block w-full px-3 py-2 border rounded-md appearance-none focus:outline-none focus:ring";
  
  // Classes based on error state
  const selectClasses = error
    ? `${baseSelectClasses} border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500`
    : `${baseSelectClasses} border-coffee-cream focus:border-coffee-medium focus:ring-coffee-light focus:ring-opacity-50`;
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-coffee-dark mb-1"
        >
          {label}
          {required && <span className="text-coffee-accent ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined}
          className={`${selectClasses} ${className} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          {...rest}
        >
          {showEmptyOption && (
            <option value="">{placeholder}</option>
          )}
          
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      
      {helpText && !error && (
        <p id={`${selectId}-help`} className="mt-1 text-xs text-coffee-medium">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;