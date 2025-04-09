import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import ThemeSwitcher from '../components/ThemeSwitcher.js';
import { FaUser, FaSignOutAlt, FaTicketAlt, FaHome, FaListAlt, FaCoffee, FaList } from 'react-icons/fa/index.js';

const MainLayout = () => {
  const { currentUser, logOut } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-primary text-dark-primary' : 'bg-coffee-light text-coffee-dark'}`}>
      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-dark-surface shadow-coffee-dark' : 'bg-white shadow-md'} transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Logo />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  to="/dashboard" 
                  className={`${isActive('/dashboard') 
                    ? isDarkMode 
                      ? 'border-dark-accent text-dark-primary'
                      : 'border-coffee-accent text-coffee-dark'
                    : isDarkMode
                      ? 'border-transparent text-dark-secondary hover:text-dark-primary hover:border-dark-default'
                      : 'border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-cream'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  <FaHome className="mr-1" />
                  Dashboard
                </Link>
                <Link 
                  to="/backlog" 
                  className={`${isActive('/backlog')
                    ? isDarkMode 
                      ? 'border-dark-accent text-dark-primary'
                      : 'border-coffee-accent text-coffee-dark'
                    : isDarkMode
                      ? 'border-transparent text-dark-secondary hover:text-dark-primary hover:border-dark-default'
                      : 'border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-cream'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  <FaList className="mr-1" />
                  Backlog
                </Link>
                <Link 
                  to="/tickets" 
                  className={`${isActive('/tickets')
                    ? isDarkMode 
                      ? 'border-dark-accent text-dark-primary'
                      : 'border-coffee-accent text-coffee-dark'
                    : isDarkMode
                      ? 'border-transparent text-dark-secondary hover:text-dark-primary hover:border-dark-default'
                      : 'border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-cream'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  <FaListAlt className="mr-1" />
                  All Tickets
                </Link>
                <Link 
                  to="/profile" 
                  className={`${isActive('/profile')
                    ? isDarkMode 
                      ? 'border-dark-accent text-dark-primary'
                      : 'border-coffee-accent text-coffee-dark'
                    : isDarkMode
                      ? 'border-transparent text-dark-secondary hover:text-dark-primary hover:border-dark-default'
                      : 'border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-cream'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  <FaUser className="mr-1" />
                  Profile
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative flex items-center">
                {/* Theme Switcher */}
                <ThemeSwitcher className="mr-4" />
                
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-dark-primary' : 'text-coffee-dark'}`}>
                    {currentUser?.email}
                  </div>
                  <Button 
                    onClick={handleLogout}
                    variant={isDarkMode ? "outline" : "secondary"}
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
      <footer className={`${isDarkMode ? 'bg-dark-surface' : 'bg-coffee-espresso'} text-white py-4 mt-auto transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <Logo />
            </div>
            <div className={`${isDarkMode ? 'text-dark-secondary' : 'text-coffee-cream'} text-sm`}>
              &copy; {new Date().getFullYear()} Daily Grind. Start your day with a fresh ticket.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;