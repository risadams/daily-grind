/**
 * Constants and utility functions shared across the application
 */

/**
 * Status constants for consistent reference
 */
export const STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inprogress',
  IN_REVIEW: 'inreview',
  CLOSED: 'closed',
  WONT_FIX: 'wontfix'
};

/**
 * Priority constants for consistent reference
 */
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * Format a date with standardized options
 * @param {string|Date} dateValue - The date to format
 * @param {Object} options - Date formatting options
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateValue, options = {}) => {
  if (!dateValue) return 'No Date';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  return date.toLocaleDateString(undefined, mergedOptions);
};

/**
 * Format a date with time
 * @param {string|Date} dateValue - The date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (dateValue) => {
  if (!dateValue) return 'No Date';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleString(undefined, options);
};

/**
 * Truncate text to a specific length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Safe access to nested object properties
 * @param {Object} obj - The object to access
 * @param {string} path - Dot-notation path to the desired property
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any} - Property value or default
 */
export const getNestedValue = (obj, path, defaultValue = '') => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined || result === null) {
      return defaultValue;
    }
  }
  
  return result;
};