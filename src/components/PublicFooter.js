import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.js';
import '../styles/backgrounds.css';

/**
 * PublicFooter component to be used across all public-facing pages
 * Includes animated coffee bean divider and consistent footer design
 * 
 * @param {Object} props
 * @param {string} props.currentPage - The current page path (e.g., "/", "/about", "/features", etc.)
 */
const PublicFooter = ({ currentPage = "/" }) => {
  // Navigation links for the footer
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/features", label: "Features" },
    { path: "/pricing", label: "Pricing" },
    { path: "/blog", label: "Blog" },
    { path: "#", label: "Support" } // This is not a real route yet
  ];

  return (
    <>
      {/* Coffee divider */}
      <div className="relative h-24 bg-coffee-light/10">
        <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2">
          <div className="w-8 h-16 bg-coffee-dark rounded-full transform rotate-45 opacity-10 animate-bounce"></div>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-16 bg-coffee-medium rounded-full transform rotate-45 opacity-10 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
        <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2">
          <div className="w-8 h-16 bg-coffee-accent rounded-full transform rotate-45 opacity-10 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-coffee-espresso text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <nav className="flex flex-wrap justify-center space-x-6 mb-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`${
                    currentPage === link.path
                      ? "text-coffee-accent font-medium" 
                      : "text-coffee-light hover:text-white transition-colors duration-200"
                  } mb-2`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="text-center text-sm text-coffee-cream mt-6">
            &copy; {new Date().getFullYear()} Daily Grind. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default PublicFooter;