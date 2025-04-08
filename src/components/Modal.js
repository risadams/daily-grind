import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa/index.js';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  const modalRef = useRef();
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto'; // Restore scrolling
    };
  }, [isOpen, onClose]);
  
  // Close when clicking outside the modal
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
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
    >
      <div 
        ref={modalRef} 
        className={`${sizeClass} w-full bg-white rounded-lg shadow-xl transform transition-all`}
      >
        <div className="flex items-center justify-between p-4 border-b border-coffee-light">
          <h3 className="text-lg font-medium text-coffee-dark">{title}</h3>
          <button
            onClick={onClose}
            className="text-coffee-medium hover:text-coffee-dark rounded-full p-1 hover:bg-coffee-light transition-colors"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;