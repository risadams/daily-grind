import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext.js';
import { DatabaseProvider } from './context/DatabaseContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { ThemeProvider } from './context/ThemeContext.js';

// Components
import ErrorBoundary from './components/ErrorBoundary.js';

// Layouts
import MainLayout from './layouts/MainLayout.js';

// Pages
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Dashboard from './pages/Dashboard.js';
import Profile from './pages/Profile.js';
import AllTasks from './pages/AllTasks.js';
import ForgotPassword from './pages/ForgotPassword.js';
import NotFound from './pages/NotFound.js';
import LogoutPage from './pages/LogoutPage.js';
import BacklogPage from './pages/Backlog.js';
import LandingPage from './pages/LandingPage.js';
import AboutPage from './pages/AboutPage.js';
import FeaturesPage from './pages/FeaturesPage.js';
import PricingPage from './pages/PricingPage.js';
import BlogPage from './pages/BlogPage.js';
import SupportPage from './pages/SupportPage.js';
import AuthCallback from './pages/AuthCallback.js';
import ProjectsPage from './pages/ProjectsPage.js';

// Guards
import PrivateRoute from './guards/PrivateRoute.js';
import PublicRoute from './guards/PublicRoute.js';

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <DatabaseProvider>
            <ThemeProvider>
              <ToastProvider>
                <Routes>
                  {/* Root path */}
                  <Route path="/" element={<LandingPage />} />
                  
                  {/* Public routes */}
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    {/* OAuth callback route */}
                    <Route path="/auth/callback" element={<AuthCallback />} />
                  </Route>
                  
                  {/* Protected routes */}
                  <Route element={<PrivateRoute />}>
                    <Route element={<MainLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tasks" element={<AllTasks />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/backlog" element={<BacklogPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                    </Route>
                  </Route>
                  
                  {/* Not found route */}
                  <Route path="*" element={<NotFound />} />
                  <Route path="/logout" element={<LogoutPage />} />
                </Routes>
              </ToastProvider>
            </ThemeProvider>
          </DatabaseProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;