import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/api';
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  CreditCard,
  Bell,
  Building2,
  GraduationCap
} from 'lucide-react';

const AdminNavbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Applications', href: '/admin/applicants', icon: FileText },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Universities', href: '/admin/universities', icon: Building2 },
    { name: 'Programs', href: '/admin/programs', icon: GraduationCap },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  ];

  const isActive = (path) => {
    // Check if the current location pathname starts with the item's href
    // This handles cases like /admin/applicants/1 being active for /admin/applicants
    // Exception: Dashboard should only be active for exact match
    if (path === '/admin/dashboard') {
        return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    if (!isAdmin()) return;
    let isMounted = true;
    let interval;
    const fetchUnread = async () => {
      try {
        const res = await notificationsAPI.getAdminNotifications();
        const notifs = res.data || [];
        // Count notifications that are 'SENT' or 'PENDING' as unread
        const count = notifs.filter(n => n.status === 'SENT' || n.status === 'PENDING').length;
        if (isMounted) setUnreadCount(count);
      } catch (error) {
         console.warn('Failed to fetch admin notification count:', error);
         // Keep the previous count or set to 0 on error
         // if (isMounted) setUnreadCount(0);
      }
    };
    fetchUnread();
    interval = setInterval(fetchUnread, 30000); // Check every 30 seconds
    return () => { isMounted = false; clearInterval(interval); };
  }, [user, isAdmin]); // Rerun effect if user or admin status changes

  // If not admin, don't render the navbar
  if (!isAdmin()) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-lg border-b-4 border-purple-500 sticky top-0 z-50"> {/* Added sticky top-0 z-50 */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8"> {/* Changed to max-w-full */}
        <div className="flex justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0 mr-4"> {/* Added flex-shrink-0 and margin */}
            <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-200 group-hover:scale-110 flex-shrink-0"> {/* Responsive size */}
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" /> {/* Responsive size */}
              </div>
              <div className="hidden sm:block"> {/* Hide text on very small screens */}
                <h1 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">Admin Panel</h1> {/* Responsive size */}
                <p className="text-xs sm:text-sm text-purple-200 whitespace-nowrap">SIT International</p> {/* Responsive size */}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {/* Changed breakpoint to xl, reduced spacing and padding */}
          <div className="hidden xl:flex flex-grow items-center justify-center space-x-1"> {/* Added flex-grow and justify-center */}
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${ // Reduced padding/spacing
                    active
                      ? 'bg-white bg-opacity-20 text-white shadow-md backdrop-blur-sm'
                      : 'text-purple-200 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-4 h-4" /> {/* Slightly smaller icon */}
                    {item.name === 'Notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center px-1 py-0.5 text-[9px] font-bold leading-none text-white bg-red-600 rounded-full shadow-lg animate-pulse"> {/* Adjusted badge */}
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="whitespace-nowrap">{item.name}</span> {/* Added whitespace-nowrap */}
                </Link>
              );
            })}
          </div>

          {/* User Menu Area */}
          {/* Reduced overall spacing */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4"> {/* Added flex-shrink-0 and margin */}
            {/* Notification Bell */}
            <Link
              to="/admin/notifications"
              className="relative p-2 text-purple-200 hover:text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 transform hover:scale-110" // Reduced padding
            >
              <Bell className="w-5 h-5" /> {/* Slightly smaller icon */}
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full shadow-lg animate-pulse"> {/* Adjusted badge */}
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Info - Desktop */}
             {/* Reduced spacing and padding */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm"> {/* Show on lg+ */}
              <div className="text-right">
                <p className="text-sm font-semibold text-white truncate max-w-[120px]">{user?.firstName || user?.email}</p> {/* Shorter max-w */}
                <p className="text-xs text-purple-200 truncate max-w-[120px]">{user?.email}</p> {/* Shorter max-w */}
              </div>
              <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
                {user?.role || 'ADMIN'}
              </span>
            </div>

            {/* Logout Button */}
             {/* Reduced padding */}
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold text-purple-200 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 shadow-md transform hover:scale-105" // Reduced padding/spacing
            >
              <LogOut className="w-4 h-4" /> {/* Slightly smaller icon */}
              <span className="hidden md:inline">Logout</span>
            </button>

            {/* Mobile menu button */}
            {/* Changed breakpoint to xl */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-purple-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden border-t border-purple-700 border-opacity-50" // Changed breakpoint
            style={{ maxHeight: 'calc(100vh - 5rem)' , overflowY: 'auto' }} // Limit height and allow scroll
          >
            <div className="py-4 space-y-2 px-4"> {/* Added horizontal padding */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-white bg-opacity-20 text-white shadow-md'
                        : 'text-purple-200 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.name === 'Notifications' && unreadCount > 0 && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Mobile User Info & Logout */}
              <div className="mt-4 pt-4 border-t border-purple-700 border-opacity-50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {(user?.firstName?.[0] || user?.email?.[0] || 'A').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white truncate">{user?.firstName || user?.email}</p>
                    <p className="text-xs text-purple-200">{user?.role || 'ADMIN'}</p>
                  </div>
                </div>
                 {/* Logout button moved inside for mobile */}
                 <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center space-x-2 w-full mt-2 px-4 py-3 text-sm font-semibold text-purple-200 bg-red-600 bg-opacity-80 hover:bg-opacity-100 rounded-lg transition-all duration-200 shadow-md"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;