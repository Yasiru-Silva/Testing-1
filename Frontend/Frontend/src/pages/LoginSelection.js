import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Shield, 
  ArrowRight,
  Users,
  Settings,
  BookOpen,
  Globe,
  Award
} from 'lucide-react';

const LoginSelection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to SIT International
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your portal to access your study abroad journey or administrative functions
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {/* Student Login Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="text-center">
                {/* Student Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Student Portal
                </h2>
                <p className="text-gray-600 mb-6">
                  Access your study abroad applications, track your progress, and manage your documents
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span>Browse Programs</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <Award className="w-5 h-5 text-blue-500" />
                    <span>Apply Online</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span>Track Applications</span>
                  </div>
                </div>

                {/* Login Button */}
                <Link
                  to="/student-login"
                  className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                >
                  <span>Student Login</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>

                {/* Additional Links */}
                <div className="mt-4 space-y-2">
                  <Link
                    to="/register"
                    className="block text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    New Student? Register Here
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Admin Login Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="text-center">
                {/* Admin Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Admin Portal
                </h2>
                <p className="text-gray-600 mb-6">
                  Manage applications, review documents, and oversee the study abroad program
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span>User Management</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <Settings className="w-5 h-5 text-purple-500" />
                    <span>System Control</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <span>Application Review</span>
                  </div>
                </div>

                {/* Login Button */}
                <Link
                  to="/admin-login"
                  className="inline-flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg"
                >
                  <span>Admin Login</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>

                {/* Additional Info */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500">
                    Restricted access for authorized personnel
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Section */}
          <motion.div
            variants={itemVariants}
            className="mt-12"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Need Help?
              </h3>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                <Link
                  to="/contact"
                  className="hover:text-blue-600 transition-colors"
                >
                  Contact Support
                </Link>
                <Link
                  to="/help"
                  className="hover:text-blue-600 transition-colors"
                >
                  Help Center
                </Link>
                <Link
                  to="/faq"
                  className="hover:text-blue-600 transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Homepage
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginSelection;



















