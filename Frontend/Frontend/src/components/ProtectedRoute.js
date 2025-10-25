import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, Shield, User } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null, allowedUserTypes = ['STUDENT', 'ADMIN'] }) => {
  const { isAuthenticated, user, isAdmin, isStudent, loading } = useAuth();
  const location = useLocation();

  // Wait for auth to initialize (prevents redirect loop on refresh)
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user type is allowed
  if (!allowedUserTypes.includes(user?.userType)) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center bg-white rounded-xl shadow-lg border border-secondary-200 p-8"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Access Denied
          </h1>
          <p className="text-secondary-600 mb-6">
            You don't have permission to access this page. This area is restricted to specific user types.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-outline"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Check if specific role is required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center bg-white rounded-xl shadow-lg border border-secondary-200 p-8"
        >
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Insufficient Permissions
          </h1>
          <p className="text-secondary-600 mb-2">
            You need <strong>{requiredRole}</strong> role to access this page.
          </p>
          <p className="text-sm text-secondary-500 mb-6">
            Your current role: <span className="font-medium">{user?.role || 'None'}</span>
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-outline"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Check admin-specific access
  if (requiredRole === 'ADMIN' || allowedUserTypes.includes('ADMIN')) {
    if (user?.userType === 'ADMIN' && !isAdmin()) {
      return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center bg-white rounded-xl shadow-lg border border-secondary-200 p-8"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">
              Admin Access Required
            </h1>
            <p className="text-secondary-600 mb-6">
              This is an admin-only area. Please log in with admin credentials.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="btn-primary"
              >
                Login
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-outline"
              >
                Return to Home
              </button>
            </div>
          </motion.div>
        </div>
      );
    }
  }

  // Check student-specific access
  if (allowedUserTypes.includes('STUDENT') && !allowedUserTypes.includes('ADMIN')) {
    if (user?.userType !== 'STUDENT') {
      return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center bg-white rounded-xl shadow-lg border border-secondary-200 p-8"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">
              Student Area
            </h1>
            <p className="text-secondary-600 mb-6">
              This area is restricted to students only. Please log in with student credentials.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="btn-primary"
              >
                Login
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-outline"
              >
                Return to Home
              </button>
            </div>
          </motion.div>
        </div>
      );
    }
  }

  // All checks passed, render the protected component
  return children;
};

export default ProtectedRoute;




