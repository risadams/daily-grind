import React from 'react';
import { Link } from 'react-router-dom';
import { FaCoffee } from 'react-icons/fa/index.js';

const Logo = ({ size = 'normal', asLink = true }) => {
  // Determine size class based on prop
  const sizeClass = size === 'small'
    ? 'h-8 w-8'
    : size === 'large'
      ? 'h-16 w-16'
      : 'h-10 w-10';
      
  // Common logo content
  const LogoContent = () => (
    <>
      <div className={`relative ${sizeClass} mr-2`}>
        <div className="absolute inset-0 bg-coffee-medium rounded-lg transform rotate-12" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-coffee-dark rounded-lg transform -rotate-6" aria-hidden="true"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-3/4 h-3/4 bg-coffee-cream rounded-md flex items-center justify-center">
            {/* FontAwesome coffee-cup icon */}
            <FaCoffee className="h-full w-full p-1 text-coffee-dark" />

            {/* Steam effect */}
            <div className="absolute top-0 -mt-1 left-1/4 w-1/4 h-1 bg-coffee-light rounded animate-steam opacity-60"></div>
            <div className="absolute top-0 -mt-2 left-1/2 w-1/4 h-1 bg-coffee-light rounded animate-steam opacity-80" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>
      <div className="font-display font-bold">
        <span className="text-coffee-dark">Daily</span>
        <span className="text-coffee-accent">Grind</span>
      </div>
    </>
  );

  // Handle click (without relying on React Router)
  const handleClick = () => {
    window.location.href = '/';
  };

  // If not used as a link, return a div
  if (!asLink) {
    return (
      <div className="flex items-center">
        <LogoContent />
      </div>
    );
  }

  // Always use a regular button unless explicitly in a working Router context
  return (
    <button 
      onClick={handleClick}
      className="flex items-center cursor-pointer hover:opacity-90 transition-opacity border-none bg-transparent p-0"
    >
      <LogoContent />
    </button>
  );
};

export default Logo;