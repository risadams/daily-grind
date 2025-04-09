import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa/index.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useTheme } from '../context/ThemeContext.js';

/**
 * Accessible Dialog component
 * Implements WAI-ARIA best practices for dialogs
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the dialog is open
 * @param {Function} props.onClose Function to close the dialog
 * @param {string} props.title Dialog title
 * @param {React.ReactNode} props.children Dialog content
 * @param {string} props.size Size of the dialog ('sm', 'md', 'lg', 'xl', 'full')
 * @param {boolean} props.disableEscapeKey Disable closing the dialog with the escape key
 * @param {boolean} props.disableBackdropClick Disable closing the dialog when clicking outside
 */
const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  disableEscapeKey = false,
  disableBackdropClick = false,
  ariaDescribedby
}) => {
  const { isDarkMode } = useTheme();
  const dialogRef = useRef(null);
  
  // Generate unique IDs for accessibility attributes
  const titleId = useRef(`dialog-title-${Math.random().toString(36).substr(2, 9)}`);
  const descriptionId = ariaDescribedby || `dialog-desc-${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle escape key press
  const handleEscapeKey = () => {
    if (!disableEscapeKey) {
      onClose();
    }
  };

  // Use focus trap to manage keyboard focus within the dialog
  const containerRef = useFocusTrap(isOpen, {
    onEscapeKey: handleEscapeKey
  });

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (disableBackdropClick) return;
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);
  
  // Don't render anything if the dialog is closed
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full'
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="presentation" 
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay/backdrop */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
        >
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-dark-surface' : 'bg-coffee-dark'} bg-opacity-75`}></div>
        </div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Dialog */}
        <div 
          ref={(node) => {
            dialogRef.current = node;
            if (containerRef) {
              containerRef.current = node;
            }
          }}
          className={`inline-block align-bottom ${
            isDarkMode 
              ? 'bg-dark-primary text-dark-primary border border-dark-default'
              : 'bg-white text-coffee-dark'
          } rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId.current}
          aria-describedby={descriptionId}
        >
          <div>
            {/* Dialog header */}
            <div className={`flex justify-between items-center px-6 py-4 border-b ${
              isDarkMode 
                ? 'border-dark-default'
                : 'border-coffee-light'
            }`}>
              <h2 
                className={`text-lg font-medium ${isDarkMode ? 'text-dark-primary' : 'text-coffee-dark'}`} 
                id={titleId.current}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className={`rounded-full p-1 focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'text-dark-secondary hover:text-dark-primary focus:ring-dark-accent' 
                    : 'text-coffee-medium hover:text-coffee-dark focus:ring-coffee-accent'
                }`}
                aria-label="Close dialog"
                type="button"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>
            
            {/* Dialog content */}
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;