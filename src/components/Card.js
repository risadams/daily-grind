import React from 'react';

/**
 * Card component with coffee-themed styling
 */
const Card = ({ 
  children, 
  title = '', 
  subtitle = '',
  variant = 'default',
  className = '',
  headerAction = null
}) => {
  // Variant styles
  const variantClasses = {
    default: 'bg-white',
    highlighted: 'bg-coffee-light border-l-4 border-coffee-medium',
    outlined: 'bg-white border border-coffee-cream'
  };

  return (
    <div className={`
      ${variantClasses[variant]} 
      rounded-lg shadow-coffee overflow-hidden
      transition-all duration-200 ease-in-out
      hover:shadow-coffee-hover
      ${className}
    `}>
      {(title || headerAction) && (
        <div className="px-4 py-4 sm:px-6 border-b border-coffee-light flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-medium text-coffee-espresso">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-coffee-medium">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="ml-4">{headerAction}</div>
          )}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;