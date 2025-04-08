import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import { FaCoffee, FaClock, FaUsers, FaCheckCircle } from 'react-icons/fa/index.js';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-coffee-light">
        <div className="relative pt-6 pb-16 sm:pb-24">
          <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-between w-full">
                <Logo size="large" />
                <div className="hidden space-x-4 sm:flex">
                  <Link to="/login" className="text-base font-medium text-coffee-dark hover:text-coffee-medium px-3 py-2 rounded-md">
                    Sign in
                  </Link>
                  <Button variant="primary" size="small" onClick={() => navigate('/register')}>
                    Sign up
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          <div className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-display font-bold text-coffee-espresso sm:text-5xl md:text-6xl">
                <span className="block">Simplify your</span>
                <span className="block text-coffee-accent">daily grind</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-coffee-medium sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Stay organized, focused, and productive with our all-in-one task management solution.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={() => navigate('/register')}
                    fullWidth
                  >
                    Get started
                  </Button>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={() => navigate('/login')}
                    fullWidth
                  >
                    Sign in
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-coffee-accent font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold font-display tracking-tight text-coffee-espresso sm:text-4xl">
              Everything you need to stay productive
            </p>
            <p className="mt-4 max-w-2xl text-xl text-coffee-medium lg:mx-auto">
              Manage your tasks, track your time, and collaborate with your team - all in one place.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-coffee-medium text-white">
                    <FaCoffee className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-coffee-dark">Task Management</h3>
                  <p className="mt-2 text-base text-coffee-medium">
                    Create, organize, and prioritize your tasks to stay on top of your workload.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-coffee-medium text-white">
                    <FaClock className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-coffee-dark">Time Tracking</h3>
                  <p className="mt-2 text-base text-coffee-medium">
                    Track time spent on tasks and projects to improve your productivity.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-coffee-medium text-white">
                    <FaUsers className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-coffee-dark">Team Collaboration</h3>
                  <p className="mt-2 text-base text-coffee-medium">
                    Work together with your team to achieve your goals faster.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-coffee-medium text-white">
                    <FaCheckCircle className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-coffee-dark">Multiple Authentication Options</h3>
                  <p className="mt-2 text-base text-coffee-medium">
                    Sign in with Google, GitHub, Apple, or Microsoft for a seamless experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-coffee-light">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-bold font-display tracking-tight text-coffee-dark sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-coffee-accent">Start using Daily Grind today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/register')}
              >
                Get started
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button
                variant="secondary"
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-coffee-espresso text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <p className="text-center text-base text-coffee-cream">
            &copy; {new Date().getFullYear()} Daily Grind. Start your day with a fresh cup of productivity.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;