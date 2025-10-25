import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu,
  X,
  Globe,
  Home as HomeIcon,
  User,
  GraduationCap, // Icon for Universities
  Phone,
  FileText,      // Icon for Apply Now
  BookOpen,      // <--- 1. IMPORT BookOpen icon for Programs
  LogIn,
  LogOut,
  Settings,
  Shield,
  Bell
} from 'lucide-react';
import { notificationsAPI } from '../services/api';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin, isStudent } = useAuth();

  useEffect(() => {
    let intervalId = null;
    if (isAuthenticated && isStudent() && (user?.studentId || user?.userId)) {
      loadUnreadCount();
      intervalId = setInterval(loadUnreadCount, 30000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, isStudent, user?.studentId, user?.userId]);


  const loadUnreadCount = async () => {
    const studentId = user?.studentId || user?.userId;
    if (!studentId) return;

    try {
      const response = await notificationsAPI.getStudentNotifications(studentId);
      const notifications = response.data || [];
      const unread = notifications.filter(n => n.status === 'SENT' || n.status === 'PENDING').length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Universities', path: '/universities', icon: GraduationCap },
    { name: 'Programs', path: '/programs', icon: BookOpen }, // <--- 2. UPDATED icon here
    { name: 'Apply Now', path: '/apply', icon: FileText }, // Kept FileText for Apply Now
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;

  const closeMenus = () => {
      setIsOpen(false);
      setShowUserMenu(false);
  };


  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMenus}>
            <img src={logo} alt="SIT International Logo" className="w-10 h-10 object-contain"/>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient whitespace-nowrap">SIT International</h1>
              <p className="text-xs text-secondary-500 whitespace-nowrap">Study Abroad Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={closeMenus}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={closeMenus} className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 px-2 sm:px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 text-sm sm:text-base">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link to="/register" onClick={closeMenus} className="btn-primary text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                  <User className="w-4 h-4 mr-1 hidden sm:inline" /> Register
                </Link>
              </>
            ) : (
              <>
                {isStudent() && (
                  <Link to="/student/notifications" onClick={closeMenus} className="relative p-2 text-secondary-700 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors duration-200">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 text-secondary-700 hover:text-primary-600 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium hidden sm:inline"> {user?.firstName || user?.email} </span>
                    {isAdmin() && <Shield className="w-4 h-4 text-green-600 hidden sm:inline" />}
                  </button>
                 <AnimatePresence>
                  {showUserMenu && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 z-50" onMouseLeave={() => setShowUserMenu(false)}>
                      <Link to="/dashboard" onClick={closeMenus} className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50"> <Settings className="w-4 h-4" /> <span>Dashboard</span> </Link>
                      {isStudent() && ( <Link to="/student/notifications" onClick={closeMenus} className="flex items-center justify-between space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50"> <div className="flex items-center space-x-2"> <Bell className="w-4 h-4" /> <span>Notifications</span> </div> {unreadCount > 0 && ( <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full"> {unreadCount} </span> )} </Link> )}
                      {isAdmin() && ( <Link to="/admin" onClick={closeMenus} className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50"> <Shield className="w-4 h-4" /> <span>Admin Panel</span> </Link> )}
                      <button onClick={() => { logout(); closeMenus(); }} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"> <LogOut className="w-4 h-4" /> <span>Logout</span> </button>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </>
            )}
            <div className="md:hidden">
                 <button onClick={() => { setIsOpen(!isOpen); setShowUserMenu(false); }} className="p-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"> {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />} </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-secondary-200" style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
              <div className="py-4 space-y-2 px-4">
                {navItems.map((item) => { const Icon = item.icon; return ( <Link key={item.name} to={item.path} onClick={closeMenus} className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${ isActive(item.path) ? 'text-primary-600 bg-primary-50' : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50' }`}> <Icon className="w-5 h-5" /> <span>{item.name}</span> </Link> ); })}
                <div className="pt-4 border-t border-secondary-200 space-y-2">
                  {!isAuthenticated ? ( <> <Link to="/login" onClick={closeMenus} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"> <LogIn className="w-5 h-5" /> <span>Login</span> </Link> <Link to="/register" onClick={closeMenus} className="flex items-center justify-center space-x-2 mx-0 btn-primary"> <User className="w-4 h-4" /> <span>Register</span> </Link> </> ) : ( <> <Link to="/dashboard" onClick={closeMenus} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"> <Settings className="w-5 h-5" /> <span>Dashboard</span> </Link> {isStudent() && ( <Link to="/student/notifications" onClick={closeMenus} className="flex items-center justify-between px-4 py-3 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"> <div className="flex items-center space-x-3"> <Bell className="w-5 h-5" /> <span>Notifications</span> </div> {unreadCount > 0 && ( <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full"> {unreadCount} </span> )} </Link> )} {isAdmin() && ( <Link to="/admin" onClick={closeMenus} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"> <Shield className="w-5 h-5" /> <span>Admin Panel</span> </Link> )} <button onClick={() => { logout(); closeMenus(); }} className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 text-left"> <LogOut className="w-5 h-5" /> <span>Logout</span> </button> </> )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
