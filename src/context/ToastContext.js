import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa/index.js';

// Toast context
const ToastContext = createContext();

/**
 * Custom hook to access the Toast context
 */
export function useToast() {
  return useContext(ToastContext);
}

/**
 * Toast Provider component
 * Manages toast notifications throughout the application
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  
  // Add a new toast
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      message,
      type,
      duration
    };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    return id;
  };
  
  // Remove a toast by id
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  // Shorthand methods for different toast types
  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const info = (message, duration) => addToast(message, 'info', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);
  
  // Auto-remove toasts after their duration
  useEffect(() => {
    const timeouts = toasts.map(toast => {
      return setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [toasts]);
  
  // Context value
  const value = {
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
  
  // Helper to get icon based on toast type
  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <FaExclamationCircle className="h-5 w-5 text-yellow-500" />;
      default:
      case 'info':
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Helper to get background color based on toast type
  const getToastBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`flex items-center justify-between p-4 rounded-md shadow-md border ${getToastBgColor(toast.type)} transform transition-all duration-300 animate-slide-in`}
              role="alert"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  {getToastIcon(toast.type)}
                </div>
                <div className="text-sm font-medium">
                  {toast.message}
                </div>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastContext;