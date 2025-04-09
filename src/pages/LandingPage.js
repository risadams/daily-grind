import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import { FaCoffee, FaClock, FaUsers, FaCheckCircle, FaStar, FaChartLine, FaComments } from 'react-icons/fa/index.js';
import '../styles/backgrounds.css';

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
      {/* Hero section with gradient and animation */}
      <div className="relative bg-gradient-to-b from-coffee-light to-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 coffee-pattern-bg opacity-10"></div>
          <div className="absolute right-0 top-0 transform translate-x-1/4 -translate-y-1/4">
            <div className="w-64 h-64 rounded-full bg-coffee-cream opacity-20 blur-3xl"></div>
          </div>
          <div className="absolute left-0 bottom-0 transform -translate-x-1/4 translate-y-1/4">
            <div className="w-72 h-72 rounded-full bg-coffee-accent opacity-10 blur-3xl"></div>
          </div>
        </div>
        
        <div className="relative pt-6 pb-16 sm:pb-32">
          <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-between w-full">
                <Logo size="large" />
                <div className="hidden space-x-4 sm:flex">
                  <Link to="/login" className="text-base font-medium text-coffee-dark hover:text-coffee-medium transition-colors duration-200 px-3 py-2 rounded-md">
                    Sign in
                  </Link>
                  <Button variant="primary" size="small" onClick={() => navigate('/register')} 
                    className="hover:shadow-coffee-hover transition-all duration-200">
                    Sign up
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          <div className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="text-4xl tracking-tight font-display font-bold text-coffee-espresso sm:text-5xl md:text-6xl">
                  <span className="block">Simplify your</span>
                  <span className="block text-coffee-accent">daily grind</span>
                </h1>
                <p className="mt-3 text-base text-coffee-medium sm:text-lg md:mt-5 md:text-xl">
                  Stay organized, focused, and productive with our all-in-one ticket tracking system designed specifically for Scrum teams.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                  <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                    <Button
                      variant="primary"
                      size="large"
                      onClick={() => navigate('/register')}
                      className="hover:shadow-coffee-hover transform hover:-translate-y-1 transition-all duration-200"
                    >
                      <FaCoffee className="w-5 h-5 mr-2" />
                      Get started
                    </Button>
                    <Button
                      variant="secondary"
                      size="large"
                      onClick={() => navigate('/login')}
                      className="hover:shadow-coffee transition-all duration-200"
                    >
                      Sign in
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-coffee-medium">
                    <span className="font-medium text-coffee-dark">No credit card required.</span> Get started in minutes.
                  </p>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-coffee lg:max-w-md">
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                    <img
                      className="w-full"
                      src="/images/dashboard-preview.png"
                      alt="Daily Grind dashboard preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/600x400?text=Daily+Grind+Dashboard';
                      }}
                    />
                    <div className="absolute inset-0 bg-coffee-espresso mix-blend-multiply opacity-10"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated coffee beans divider */}
      <div className="relative h-24 bg-white">
        <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2">
          <div className="w-8 h-16 bg-coffee-dark rounded-full transform rotate-45 opacity-10 animate-bounce"></div>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-16 bg-coffee-medium rounded-full transform rotate-45 opacity-10 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
        <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2">
          <div className="w-8 h-16 bg-coffee-accent rounded-full transform rotate-45 opacity-10 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
      
      {/* Enhanced features section with cards */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-coffee-accent font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold font-display tracking-tight text-coffee-espresso sm:text-4xl">
              Everything you need to stay productive
            </p>
            <p className="mt-4 max-w-3xl text-xl text-coffee-medium lg:mx-auto">
              Manage your tasks, track your time, and collaborate with your team - all in one place.
            </p>
          </div>

          <div className="mt-12">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {[
                {
                  icon: <FaCoffee className="h-8 w-8" />,
                  title: "Task Management",
                  description: "Create, organize, and prioritize your tickets to stay on top of your workload.",
                },
                {
                  icon: <FaClock className="h-8 w-8" />,
                  title: "Time Tracking",
                  description: "Track time spent on tasks and projects to improve your productivity and estimates.",
                },
                {
                  icon: <FaUsers className="h-8 w-8" />,
                  title: "Team Collaboration",
                  description: "Work together with your team to achieve your goals faster and more effectively.",
                },
                {
                  icon: <FaChartLine className="h-8 w-8" />,
                  title: "Analytics & Reports",
                  description: "Get insights into your team's performance with powerful analytics and reports.",
                },
                {
                  icon: <FaComments className="h-8 w-8" />,
                  title: "Built-in Retrospectives",
                  description: "Facilitate effective sprint retrospectives with our built-in tools and templates.",
                },
                {
                  icon: <FaCheckCircle className="h-8 w-8" />,
                  title: "Multiple Authentication",
                  description: "Sign in with Google, GitHub, Apple, or Microsoft for a seamless experience.",
                },
              ].map((feature, index) => (
                <div key={index} className="relative p-6 bg-white rounded-xl shadow-coffee hover:shadow-coffee-hover transform hover:-translate-y-1 transition-all duration-300 border border-coffee-light/20">
                  <div className="absolute -top-4 -left-4 bg-gradient-to-br from-coffee-medium to-coffee-dark p-3 rounded-xl text-white">
                    {feature.icon}
                  </div>
                  <div className="pl-4 pt-4">
                    <h3 className="text-xl leading-6 font-bold text-coffee-dark font-display">{feature.title}</h3>
                    <p className="mt-2 text-base text-coffee-medium">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="bg-coffee-light/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-coffee-accent font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-bold font-display tracking-tight text-coffee-espresso sm:text-4xl">
              What our users are saying
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                role: "Scrum Master",
                company: "Agile Solutions",
                quote: "Daily Grind has transformed how our team works. The intuitive interface and focus on agile principles makes it a joy to use.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Product Owner",
                company: "TechPro Software",
                quote: "Finally, a ticket system that actually understands agile! Our sprints are more focused and our team is more productive.",
                rating: 5,
              },
              {
                name: "Priya Patel",
                role: "Development Lead",
                company: "InnovateTech",
                quote: "The coffee-themed interface is fun, but the real value is in how it streamlines our workflow. Highly recommended!",
                rating: 4,
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-coffee relative">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="h-5 w-5 text-yellow-500" />
                  ))}
                </div>
                <blockquote className="text-coffee-dark text-lg italic mb-6">"{testimonial.quote}"</blockquote>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-coffee-medium/20 flex items-center justify-center text-coffee-dark font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-coffee-espresso">{testimonial.name}</div>
                    <div className="text-coffee-medium text-sm">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CTA section with background effect */}
      <div className="bg-gradient-to-r from-coffee-medium to-coffee-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-coffee-espresso/10"></div>
          <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/4">
            <div className="w-96 h-96 rounded-full bg-coffee-light opacity-10 blur-3xl"></div>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold font-display tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to dive in?</span>
              <span className="block text-coffee-light">Start using Daily Grind today.</span>
            </h2>
            <p className="mt-4 text-lg text-coffee-light/70 max-w-3xl">
              Join thousands of teams who have already brewed better productivity with Daily Grind.
              No credit card required, free trial for 30 days.
            </p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 lg:mt-0 lg:flex-shrink-0">
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/register')}
              className="hover:shadow-coffee-hover transform hover:-translate-y-1 transition-all duration-200 bg-coffee-cream text-coffee-dark hover:bg-white/80 hover:text-coffee-espresso"
            >
              <FaCoffee className="w-5 h-5 mr-2" />
              Get started free
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={() => navigate('/login')}
              className="border-white text-white hover:bg-white/10 transition-all duration-200"
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced footer with more links and social media */}
      <footer className="bg-coffee-espresso text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#" className="text-coffee-light hover:text-white transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-coffee-light hover:text-white transition-colors duration-200">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <div className="flex justify-center space-x-6 text-sm text-coffee-cream mb-4">
              <a href="#" className="hover:text-white transition-colors duration-200">About</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Features</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Pricing</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Blog</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Support</a>
            </div>
          </div>
          <p className="text-center text-sm text-coffee-cream mt-6">
            &copy; {new Date().getFullYear()} Daily Grind. Start your day with a fresh cup of productivity.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;