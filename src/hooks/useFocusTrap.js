import { useEffect, useRef } from 'react';

/**
 * A custom hook that traps focus within a container
 * Important for accessibility in modals and dialogs
 * 
 * @param {boolean} isActive - Whether the focus trap is active
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFocus - Whether to auto focus the first element
 * @param {Function} options.onEscapeKey - Callback when Escape key is pressed
 * @returns {Object} - The ref to attach to the container
 */
export const useFocusTrap = (isActive, { autoFocus = true, onEscapeKey } = {}) => {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Find all focusable elements within the container
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      return Array.from(focusableElements).filter(
        (element) => !element.hasAttribute('disabled')
      );
    };

    // Focus the first focusable element initially
    const handleInitialFocus = () => {
      if (!autoFocus) return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else if (containerRef.current) {
        // If no focusable elements, focus the container itself
        containerRef.current.setAttribute('tabindex', '-1');
        containerRef.current.focus();
      }
    };

    // Handle tab key navigation to keep focus within the container
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Trap focus in a loop
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    // Handle escape key
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && onEscapeKey) {
        onEscapeKey();
      }
    };

    // Event listener for key presses
    const handleKeyDown = (e) => {
      handleTabKey(e);
      handleEscapeKey(e);
    };

    // Set up event listeners
    document.addEventListener('keydown', handleKeyDown);
    
    // Initial focus
    handleInitialFocus();

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the previous active element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, autoFocus, onEscapeKey]);

  return containerRef;
};

export default useFocusTrap;