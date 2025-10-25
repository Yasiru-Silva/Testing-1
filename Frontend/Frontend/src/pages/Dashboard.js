import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (isAdmin()) {
        navigate('/admin/dashboard');
      } else if (isStudent()) {
        navigate('/student/dashboard');
      } else {
        // Default redirect for other user types
        navigate('/student/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [user, isAdmin, isStudent, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-secondary-900 mb-2">Loading Dashboard...</h1>
        <p className="text-secondary-600">Redirecting you to your personalized dashboard.</p>
      </div>
    </div>
  );

};

export default Dashboard;

