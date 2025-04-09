import React, { useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import ThemeSwitcher from '../components/ThemeSwitcher.js';
import SkipToContent from '../components/SkipToContent.js';
import { FaUser, FaSignOutAlt, FaTicketAlt, FaHome, FaListAlt, FaCoffee, FaList, FaBars } from 'react-icons/fa/index.js';

const MainLayout = () => {
  const { currentUser, logOut } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  // Navigation links data for DRY code
  const navLinks = [
    { path: '/dashboard', icon: <FaHome className="mr-1" />, label: 'Dashboard' },
    { path: '/backlog', icon: <FaList className="mr-1" />, label: 'Backlog' },
    { path: '/tickets', icon: <FaListAlt className="mr-1" />, label: 'All Tickets' },
    { path: '/profile', icon: <FaUser className="mr-1" />, label: 'Profile' }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-dark-primary text-dark-primary' : 'bg-coffee-light text-coffee-dark'}`}>
      {/* Skip to content link for accessibility */}
      <SkipToContent />
      
      {/* Navigation */}
      <nav 
        className={`${isDarkMode ? 'bg-dark-surface shadow-coffee-dark' : 'bg-white shadow-md'} transition-colors duration-200`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Logo />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map(link => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    aria-current={isActive(link.path) ? "page" : undefined}
                    className={`${isActive(link.path) 
                      ? isDarkMode 
                        ? 'border-dark-accent text-dark-primary'
                        : 'border-coffee-accent text-coffee-dark'
                      : isDarkMode
                        ? 'border-transparent text-dark-secondary hover:text-dark-primary hover:border-dark-default'
                        : 'border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-cream'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  isDarkMode 
                    ? 'text-dark-secondary hover:text-dark-primary hover:bg-dark-hover' 
                    : 'text-coffee-medium hover:text-coffee-dark hover:bg-coffee-cream'
                }`}
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <FaBars className="h-6 w-6" aria-hidden="true" />
              </button>
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
                    ariaLabel="Sign out"
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        <div 
          className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} 
          id="mobile-menu"
          ref={mobileMenuRef}
        >
          <div className={`pt-2 pb-3 space-y-1 ${isDarkMode ? 'bg-dark-surface' : 'bg-white'}`}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive(link.path) ? "page" : undefined}
                className={`${isActive(link.path)
                  ? isDarkMode 
                    ? 'bg-dark-hover text-dark-primary border-l-4 border-dark-accent'
                    : 'bg-coffee-cream text-coffee-dark border-l-4 border-coffee-accent'
                  : isDarkMode
                    ? 'text-dark-secondary hover:bg-dark-hover hover:text-dark-primary'
                    : 'text-coffee-medium hover:bg-coffee-light hover:text-coffee-dark'
                } block pl-3 pr-4 py-2 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  {link.icon}
                  {link.label}
                </div>
              </Link>
            ))}
            <div className={`px-3 py-3 border-t ${isDarkMode ? 'border-dark-default' : 'border-coffee-cream'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>
                  {currentUser?.email}
                </span>
                <div className="flex items-center space-x-3">
                  <ThemeSwitcher size="sm" />
                  <Button 
                    onClick={handleLogout}
                    variant={isDarkMode ? "outline" : "secondary"}
                    size="small"
                    icon={<FaSignOutAlt />}
                    ariaLabel="Sign out"
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
      <main 
        id="main-content" 
        className="flex-grow py-6 sm:py-8"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer 
        className={`${isDarkMode ? 'bg-dark-surface' : 'bg-coffee-espresso'} text-white py-4 transition-colors duration-200`}
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <Logo />
            </div>
            <nav aria-label="Footer Navigation">
              <ul className="flex space-x-4 mb-4 sm:mb-0">
                <li>
                  <Link 
                    to="/about" 
                    className={`${isDarkMode ? 'text-dark-secondary hover:text-dark-primary' : 'text-coffee-cream hover:text-white'} text-sm`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/support" 
                    className={`${isDarkMode ? 'text-dark-secondary hover:text-dark-primary' : 'text-coffee-cream hover:text-white'} text-sm`}
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/features" 
                    className={`${isDarkMode ? 'text-dark-secondary hover:text-dark-primary' : 'text-coffee-cream hover:text-white'} text-sm`}
                  >
                    Features
                  </Link>
                </li>
              </ul>
            </nav>
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