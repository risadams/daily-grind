import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import Logo from '../components/Logo.js';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setMessage({ type: '', text: '' });
      
      await resetPassword(email);
      setMessage({ 
        type: 'success', 
        text: 'Check your email for password reset instructions' 
      });
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to reset password. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-coffee-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-coffee-dark">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-coffee-medium">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Display messages */}
          {message.text && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <span className="block sm:inline">{message.text}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-coffee-dark">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-coffee-light rounded-md shadow-sm placeholder-coffee-light focus:outline-none focus:ring-coffee-medium focus:border-coffee-medium sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coffee-primary hover:bg-coffee-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-medium 
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-coffee-light"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-coffee-medium">
                  Or return to
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center py-2 px-4 border border-coffee-light rounded-md shadow-sm bg-white text-sm font-medium text-coffee-dark hover:bg-coffee-light"
                >
                  Sign in
                </Link>
              </div>
              <div>
                <Link
                  to="/register"
                  className="w-full inline-flex justify-center py-2 px-4 border border-coffee-light rounded-md shadow-sm bg-white text-sm font-medium text-coffee-dark hover:bg-coffee-light"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;