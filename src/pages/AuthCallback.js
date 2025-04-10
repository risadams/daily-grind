import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { FaCoffee } from 'react-icons/fa/index.js';

const AuthCallback = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get token from URL query params
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (!token) {
          setError('Authentication failed. No token received.');
          return;
        }

        // Process the token
        await handleAuthCallback(token);
        
        // Redirect to dashboard on success
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to authenticate: ' + (err.message || 'Unknown error'));
      }
    };

    processAuth();
  }, [handleAuthCallback, location.search, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-coffee-light p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-coffee p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-coffee-light/30 p-3 rounded-full animate-pulse">
            <FaCoffee className="h-full w-full text-coffee-dark" />
          </div>
        </div>
        
        <h2 className="text-2xl font-display font-bold text-coffee-dark mb-4">
          {error ? 'Authentication Error' : 'Signing you in...'}
        </h2>
        
        {error ? (
          <div>
            <p className="text-coffee-accent mb-4">{error}</p>
            <button 
              onClick={() => navigate('/login')}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-coffee-dark hover:bg-coffee-espresso focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-medium"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-coffee-medium rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;