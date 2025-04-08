import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import { FaUser, FaSignOutAlt, FaTicketAlt, FaHome, FaListAlt } from 'react-icons/fa/index.js';

const MainLayout = () => {
  const { currentUser, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-coffee-light">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Logo />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  to="/dashboard" 
                  className="border-coffee-medium text-coffee-dark hover:text-coffee-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <FaHome className="mr-1" />
                  Dashboard
                </Link>
                <Link 
                  to="/tickets" 
                  className="border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-cream inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <FaListAlt className="mr-1" />
                  All Tickets
                </Link>
                <Link 
                  to="/profile" 
                  className="border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-cream inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <FaUser className="mr-1" />
                  Profile
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-coffee-dark">
                    {currentUser?.email}
                  </div>
                  <Button 
                    onClick={handleLogout}
                    variant="secondary"
                    size="small"
                    icon={<FaSignOutAlt />}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-coffee-espresso text-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <Logo />
            </div>
            <div className="text-coffee-cream text-sm">
              &copy; {new Date().getFullYear()} Daily Grind. Start your day with a fresh ticket.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;