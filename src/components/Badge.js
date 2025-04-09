import React from 'react';

/**
 * Badge component for displaying status, priority, and other indicators
 * with standardized styling across the application.
 * 
 * @param {Object} props
 * @param {string} props.text - The text to display in the badge
 * @param {string} props.type - The type of badge (status, priority, custom)
 * @param {string} props.value - The value for predefined types (e.g., "high" for priority)
 * @param {string} props.color - Custom color class when not using predefined types
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.icon - Optional icon to display before the text
 */
const Badge = ({ 
  text, 
  type = 'custom', 
  value = '', 
  color = '', 
  className = '',
  icon = null
}) => {
  // Helper function to get status color class
  const getStatusColorClass = (status) => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '');
    
    switch (normalizedStatus) {
      case 'closed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'inprogress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'review':
      case 'inreview':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'todo':
      case 'to-do':
      case 'backlog':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'wontfix':
      case 'won\'tfix':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-coffee-light text-coffee-dark border border-coffee-medium';
    }
  };
  
  // Helper function to get priority color class
  const getPriorityColorClass = (priority) => {
    const normalizedPriority = priority.toLowerCase();
    
    switch (normalizedPriority) {
      case 'highest':
      case 'high':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low':
      case 'lowest':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  
  // Determine the color class based on type and value
  let colorClass = color;
  if (type === 'status') {
    colorClass = getStatusColorClass(value || text);
  } else if (type === 'priority') {
    colorClass = getPriorityColorClass(value || text);
  }
  
  return (
    <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${colorClass} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </span>
  );
};

export default Badge;