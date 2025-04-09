import React from 'react';

/**
 * Avatar component for displaying user profile images or initials
 * with standardized styling across the application.
 * 
 * @param {Object} props
 * @param {string} props.name - User's name or email (used for initials when no image available)
 * @param {string} props.src - Optional image URL for the avatar
 * @param {string} props.size - Size of avatar (xs, sm, md, lg, xl)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.border - Whether to display a border
 */
const Avatar = ({
  name = '',
  src = '',
  size = 'md',
  className = '',
  border = false
}) => {
  // Get user's initials from their name/email
  const getInitials = () => {
    if (!name) return '';
    
    // If it looks like an email address
    if (name.includes('@')) {
      return name.charAt(0).toUpperCase();
    }
    
    // Otherwise get first letter of first and last name
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Size classes
  const sizeClasses = {
    'xs': 'h-6 w-6 text-xs',
    'sm': 'h-8 w-8 text-sm',
    'md': 'h-10 w-10 text-base',
    'lg': 'h-12 w-12 text-lg',
    'xl': 'h-16 w-16 text-xl'
  };
  
  const borderClass = border ? 'border-2 border-coffee-cream' : '';
  
  // If we have an image, display it
  if (src) {
    return (
      <img 
        src={src} 
        alt={`${name}'s avatar`} 
        className={`rounded-full object-cover ${sizeClasses[size]} ${borderClass} ${className}`}
        onError={(e) => {
          // On error, fall back to initials
          e.target.style.display = 'none';
          e.target.parentNode.querySelector('.avatar-initials').style.display = 'flex';
        }}
      />
    );
  }
  
  // Otherwise display initials
  return (
    <div 
      className={`avatar-initials rounded-full flex items-center justify-center bg-coffee-medium text-white font-medium ${sizeClasses[size]} ${borderClass} ${className}`}
      aria-label={`${name}'s avatar`}
    >
      {getInitials()}
    </div>
  );
};

export default Avatar;