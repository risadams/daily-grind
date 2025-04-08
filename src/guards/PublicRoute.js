import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const PublicRoute = () => {
  const { currentUser, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-light flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-primary"></div>
        <span className="ml-3 text-coffee-dark">Loading...</span>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  return currentUser ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default PublicRoute;