import React from 'react';
import Logo from './Logo.js';
import '../styles/backgrounds.css';

/**
 * PublicHero component to be used across all public-facing pages
 * Provides a consistent hero section with customizable title and description
 * Styled with a light gradient background similar to the landing page
 * 
 * @param {Object} props
 * @param {string} props.title - The main title text
 * @param {string} props.subtitle - The subtitle or description text
 * @param {string} props.gradientDirection - Direction of gradient: 'br' (bottom-right), 'b' (bottom), 'r' (right) 
 * @param {boolean} props.lightStyle - Whether to use light style (landing page style) or dark style
 * @param {boolean} props.showLogo - Whether to show the logo (default: true)
 * @param {string} props.logoSize - Size of the logo: 'small', 'medium', 'large'
 */
const PublicHero = ({ 
  title, 
  subtitle, 
  gradientDirection = 'b', 
  lightStyle = true,
  showLogo = true,
  logoSize = 'large'
}) => {
  // Map gradient direction to the appropriate Tailwind class based on style
  const gradientClass = lightStyle 
    ? 'from-coffee-light to-white' // Light style (landing page style)
    : {
        'br': 'from-coffee-dark via-coffee-medium to-coffee-dark',
        'b': 'from-coffee-dark to-coffee-medium',
        'r': 'from-coffee-medium to-coffee-dark',
      }[gradientDirection] || 'from-coffee-dark via-coffee-medium to-coffee-dark';

  // Text color based on style
  const textColor = lightStyle ? 'text-coffee-espresso' : 'text-white';
  const subtitleColor = lightStyle ? 'text-coffee-medium' : 'text-coffee-light/90';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-${gradientDirection} ${gradientClass} py-16`}>
      <div className="absolute inset-0">
        <div className="absolute inset-0 coffee-pattern-bg opacity-10"></div>
        {lightStyle ? (
          <>
            <div className="absolute right-0 top-0 transform translate-x-1/4 -translate-y-1/4">
              <div className="w-64 h-64 rounded-full bg-coffee-cream opacity-20 blur-3xl"></div>
            </div>
            <div className="absolute left-0 bottom-0 transform -translate-x-1/4 translate-y-1/4">
              <div className="w-72 h-72 rounded-full bg-coffee-accent opacity-10 blur-3xl"></div>
            </div>
          </>
        ) : (
          <>
            <div className="absolute left-0 bottom-0 transform -translate-x-1/3 translate-y-1/2">
              <div className="w-96 h-96 rounded-full bg-coffee-light opacity-20 blur-3xl"></div>
            </div>
            <div className="absolute right-0 top-0 transform translate-x-1/3 -translate-y-1/2">
              <div className="w-96 h-96 rounded-full bg-coffee-accent opacity-10 blur-3xl"></div>
            </div>
          </>
        )}
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {showLogo && <Logo size={logoSize} />}
        <h1 className={`mt-6 text-4xl sm:text-5xl md:text-6xl font-bold font-display ${textColor}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-4 text-xl ${subtitleColor} max-w-3xl mx-auto`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PublicHero;