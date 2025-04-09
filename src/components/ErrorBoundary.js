import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button.js';
import Logo from './Logo.js';
import { FaBug, FaHome, FaRedo } from 'react-icons/fa/index.js';

/**
 * ErrorBoundary component for catching and displaying errors gracefully
 * Rather than crashing the whole app, this displays a friendly error message
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also send this to a logging service like Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      
      // If a fallback UI was provided, use it
      if (fallback) {
        return fallback;
      }
      
      // Otherwise use the default error UI
      return (
        <div className="min-h-full bg-coffee-light/20 flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-lg bg-white p-8 rounded-lg shadow-coffee">
            <div className="mb-6">
              <Logo size="large" />
            </div>
            
            <div className="p-4 mb-6 bg-red-50 text-red-800 rounded-md border border-red-200">
              <div className="flex items-center justify-center mb-4">
                <FaBug className="text-3xl text-red-500 mr-2" />
                <h2 className="text-xl font-bold">Something went wrong</h2>
              </div>
              <p className="mb-2">
                We're sorry, but we encountered an error. Our team has been notified.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={this.handleReset} 
                variant="primary"
                className="w-full sm:w-auto"
              >
                <FaRedo className="mr-2" />
                Try Again
              </Button>
              
              <Link to="/">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2"
                >
                  <FaHome className="mr-2" />
                  Go to Homepage
                </Button>
              </Link>
            </div>
            
            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 border border-red-200 rounded-md bg-red-50 text-left overflow-auto max-h-72">
                <h3 className="font-bold text-red-800 mb-2">Error Details (Development Only):</h3>
                <pre className="text-xs text-red-800 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;