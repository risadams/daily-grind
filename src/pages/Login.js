import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { FaGoogle, FaGithub, FaApple, FaMicrosoft, FaCoffee, FaEnvelope, FaLock } from 'react-icons/fa/index.js';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import '../styles/backgrounds.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signInWithGoogle, signInWithGithub, signInWithApple, signInWithMicrosoft, currentUser, isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      setError('');
      setLoading(true);
      
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'github':
          result = await signInWithGithub();
          break;
        case 'apple':
          result = await signInWithApple();
          break;
        case 'microsoft':
          result = await signInWithMicrosoft();
          break;
        default:
          throw new Error('Invalid provider');
      }
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(`Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-coffee-light relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background coffee beans decoration */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="coffee-pattern-bg opacity-5 absolute inset-0"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-coffee-dark rounded-full opacity-5 transform rotate-45 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-coffee-accent rounded-full opacity-5 transform -rotate-12 blur-xl"></div>
      </div>
    
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <Link to="/">
          <Logo size="large" />
        </Link>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-coffee p-8 transform transition-all duration-300 hover:shadow-coffee-hover relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-coffee-light/30 p-3 rounded-full transform transition-all duration-300 hover:scale-110">
              <FaCoffee className="h-full w-full text-coffee-dark" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold text-coffee-dark">Welcome back</h2>
          <p className="mt-2 text-coffee-medium">Sign in to start your daily grind</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-coffee-accent px-4 py-3 rounded-lg relative mb-4 animate-pulse" role="alert">
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-coffee-espresso">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-coffee-medium" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-3 py-2 border-coffee-cream focus:ring-coffee-medium focus:border-coffee-medium rounded-md transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-sm font-medium text-coffee-espresso">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-coffee-accent hover:text-coffee-dark transition-colors">
                Forgot your password?
              </Link>
            </div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-coffee-medium" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full pl-10 pr-3 py-2 border-coffee-cream focus:ring-coffee-medium focus:border-coffee-medium rounded-md transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button 
              type="submit"
              disabled={loading}
              variant="primary"
              fullWidth={true}
              className="transform transition-transform duration-200 hover:translate-y-[-2px]"
            >
              {loading ? 'Brewing...' : 'Sign in'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-coffee-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-coffee-medium">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-coffee-cream rounded-md shadow-sm bg-white text-sm font-medium text-coffee-dark hover:bg-coffee-light transition-all duration-200 hover:shadow-sm"
            >
              <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
              Google
            </button>

            <button
              onClick={() => handleOAuthLogin('github')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-coffee-cream rounded-md shadow-sm bg-white text-sm font-medium text-coffee-dark hover:bg-coffee-light transition-all duration-200 hover:shadow-sm"
            >
              <FaGithub className="h-5 w-5 text-gray-800 mr-2" />
              GitHub
            </button>

            <button
              onClick={() => handleOAuthLogin('apple')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-coffee-cream rounded-md shadow-sm bg-white text-sm font-medium text-coffee-dark hover:bg-coffee-light transition-all duration-200 hover:shadow-sm"
            >
              <FaApple className="h-5 w-5 text-black mr-2" />
              Apple
            </button>

            <button
              onClick={() => handleOAuthLogin('microsoft')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-coffee-cream rounded-md shadow-sm bg-white text-sm font-medium text-coffee-dark hover:bg-coffee-light transition-all duration-200 hover:shadow-sm"
            >
              <FaMicrosoft className="h-5 w-5 text-blue-500 mr-2" />
              Microsoft
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-coffee-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-coffee-dark hover:text-coffee-accent transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center relative z-10">
        <p className="text-xs text-coffee-medium">
          &copy; {new Date().getFullYear()} Daily Grind. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;