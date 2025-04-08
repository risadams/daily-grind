import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo.js';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-coffee-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-6xl font-extrabold text-coffee-dark">404</h1>
        <h2 className="mt-2 text-3xl font-bold text-coffee-medium">Page Not Found</h2>
        <p className="mt-4 text-coffee-medium">The page you're looking for doesn't exist or has been moved.</p>
        
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-coffee-primary hover:bg-coffee-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;