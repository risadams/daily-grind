import React from 'react';

/**
 * Reusable Button component with coffee-themed styling
 */
const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  fullWidth = false,
  icon = null
}) => {
  // Variant styles
  const variantClasses = {
    primary: 'bg-coffee-dark hover:bg-coffee-espresso text-white shadow-coffee hover:shadow-coffee-hover',
    secondary: 'bg-coffee-cream hover:bg-coffee-medium text-coffee-espresso hover:text-white shadow-coffee hover:shadow-coffee-hover',
    outline: 'bg-transparent hover:bg-coffee-light text-coffee-dark border border-coffee-medium',
    danger: 'bg-coffee-accent hover:bg-red-700 text-white',
    text: 'bg-transparent text-coffee-dark hover:text-coffee-accent underline'
  };

  // Size styles
  const sizeClasses = {
    small: 'py-1 px-3 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg'
  };

  // Width style
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${widthClass}
        rounded-md font-medium transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-coffee-medium focus:ring-opacity-50
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div className="flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </div>
    </button>
  );
};

export default Button;