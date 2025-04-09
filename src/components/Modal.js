import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa/index.js';
import useFocusTrap from '../hooks/useFocusTrap.js';
import { useTheme } from '../context/ThemeContext.js';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  ariaLabelledBy, 
  ariaDescribedBy
}) => {
  const { isDarkMode } = useTheme();
  
  // Setup focus trap for accessibility
  const modalRef = useFocusTrap(isOpen, {
    autoFocus: true,
    onEscapeKey: onClose
  });
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    return () => {
      document.body.style.overflow = 'auto'; // Restore scrolling
    };
  }, [isOpen]);
  
  // Close when clicking outside the modal
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  // Generate IDs for aria attributes if not provided
  const modalId = ariaLabelledBy || `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = ariaDescribedBy || `modal-description-${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine width based on size prop
  const sizeClass = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    fullscreen: 'max-w-full h-full m-0 rounded-none'
  }[size];
  
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50" 
      onClick={handleOutsideClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={modalId}
      aria-describedby={descriptionId}
    >
      <div 
        ref={modalRef}
        className={`${sizeClass} w-full ${
          isDarkMode 
            ? 'bg-dark-surface text-dark-primary border-dark-default' 
            : 'bg-white text-coffee-dark'
        } rounded-lg shadow-xl transform transition-all`}
      >
        <div className={`flex items-center justify-between p-4 ${
          isDarkMode 
            ? 'border-b border-dark-default' 
            : 'border-b border-coffee-light'
        }`}>
          <h3 
            id={modalId}
            className={`text-lg font-medium ${
              isDarkMode ? 'text-dark-primary' : 'text-coffee-dark'
            }`}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`${
              isDarkMode 
                ? 'text-dark-secondary hover:text-dark-primary hover:bg-dark-hover' 
                : 'text-coffee-medium hover:text-coffee-dark hover:bg-coffee-light'
            } rounded-full p-1 transition-colors`}
            aria-label="Close dialog"
            type="button"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>
        <div 
          className="p-6"
          id={descriptionId}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;