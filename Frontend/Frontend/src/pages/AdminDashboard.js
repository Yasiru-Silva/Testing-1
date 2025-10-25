import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  GraduationCap,
  FileText,
  MessageSquare,
  CreditCard,
  Bell,
  Settings,
  Shield,
  TrendingUp,
  Calendar,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { adminAPI, universitiesAPI, programsAPI, contactAPI, applicationsAPI, notificationsAPI, studentsAPI } from '../services/api';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplications: 0,
    totalUniversities: 0, 
    totalPrograms: 0,     
    pendingApplications: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalPayments: 0,
    pendingPayments: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (isAdmin()) {
      const timer = setTimeout(() => {
        loadDashboardData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (isAdmin()) {
      const interval = setInterval(() => {
        loadDashboardData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found. Skipping admin dashboard data load.');
        setLoading(false);
        return;
      }

      // Arrays to hold results
      let universities = [], programs = [], messages = [], applications = [], students = [], notificationsData = [];

      // Fetch all data concurrently using Promise.allSettled
      const results = await Promise.allSettled([
        universitiesAPI.getAll(),
        programsAPI.getAll(),
        contactAPI.getAll(),
        applicationsAPI.getAllApplications(), 
        studentsAPI.getAll(),
        notificationsAPI.getAdminNotifications()
      ]);

      // Process results
      if (results[0].status === 'fulfilled') universities = results[0].value.data || [];
      else console.warn('Failed to load universities:', results[0].reason);

      if (results[1].status === 'fulfilled') programs = results[1].value.data || [];
      else console.warn('Failed to load programs:', results[1].reason);

      if (results[2].status === 'fulfilled') messages = results[2].value.data || [];
      else console.warn('Failed to load messages:', results[2].reason);

      if (results[3].status === 'fulfilled') applications = results[3].value.data || [];
      else console.warn('Failed to load applications:', results[3].reason?.response?.status, results[3].reason?.response?.data || results[3].reason?.message);

      // Fallback application fetch if primary failed or returned empty
      if ((!applications || applications.length === 0) && results[3].status === 'rejected') {
        try {
          const fallbackResp = await applicationsAPI.getAll(); // /students/applications endpoint
          applications = fallbackResp.data || [];
        } catch (fallbackErr) {
          console.warn('Fallback students/applications also failed:', fallbackErr?.response?.status, fallbackErr?.response?.data || fallbackErr?.message);
        }
      }

      if (results[4].status === 'fulfilled') students = results[4].value.data || [];
      else console.warn('Failed to load students:', results[4].reason?.response?.status, results[4].reason?.response?.data || results[4].reason?.message);

      if (results[5].status === 'fulfilled') {
          notificationsData = results[5].value.data || [];
          setNotifications(notificationsData);
      } else console.warn('Failed to load notifications:', results[5].reason);


      // Calculate stats based on fetched data
      setStats({
        totalStudents: students.length,
        totalUniversities: universities.length, 
        totalPrograms: programs.length,        
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.applicationStatus === 'PENDING').length,
        approvedApplications: applications.filter(app => app.applicationStatus === 'APPROVED').length,
        rejectedApplications: applications.filter(app => app.applicationStatus === 'REJECTED').length,
        totalMessages: messages.length,
        unreadMessages: messages.filter(msg => !msg.isRead).length, // Check if 'isRead' exists
        totalNotifications: notificationsData.length,
        unreadNotifications: notificationsData.filter(notif => notif.status === 'SENT' || notif.status === 'PENDING').length,
        totalPayments: 0, 
        pendingPayments: 0 
      });

    } catch (error) { 
      console.error('Error in loadDashboardData:', error);
      // Set default stats on any major error
      setStats({
        totalStudents: 0, totalUniversities: 0, totalPrograms: 0, totalApplications: 0,
        pendingApplications: 0, approvedApplications: 0, rejectedApplications: 0,
        totalMessages: 0, unreadMessages: 0, totalNotifications: 0,
        unreadNotifications: 0, totalPayments: 0, pendingPayments: 0
      });
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };


  // Access Denied Check
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center p-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
          <p className="text-secondary-600">You don't have admin permissions to access this page.</p>
        </div>
      </div>
    );
  }

  // Define statCards array using the state
   const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', change: 'Registered users', link: '/admin/students' },
    { title: 'Total Applications', value: stats.totalApplications, icon: FileText, color: 'bg-green-500', change: `${stats.approvedApplications} approved, ${stats.rejectedApplications} rejected`, link: '/admin/applicants' },
    { title: 'Pending Reviews', value: stats.pendingApplications, icon: AlertCircle, color: 'bg-red-500', change: stats.pendingApplications > 0 ? 'Requires attention' : 'All reviewed', link: '/admin/applicants' },
    { title: 'Messages', value: stats.totalMessages, icon: MessageSquare, color: 'bg-indigo-500', change: stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : 'All read', link: '/admin/messages' },
    { title: 'Notifications', value: stats.totalNotifications, icon: Bell, color: 'bg-yellow-500', change: stats.unreadNotifications > 0 ? `${stats.unreadNotifications} unread` : 'All read', link: '/admin/notifications' },
    { title: 'Payments', value: stats.totalPayments, icon: CreditCard, color: 'bg-purple-500', change: stats.pendingPayments > 0 ? `${stats.pendingPayments} pending` : 'All processed', link: '/admin/payments' } // Assuming a payments route
  ];


  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"> {/* max-w-6xl */}
          <div className="flex flex-wrap items-center justify-between gap-4"> {/* Added flex-wrap and gap */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center flex-shrink-0"> {/* Added flex-shrink-0 */}
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
                <p className="text-secondary-600 truncate max-w-xs"> 
                  Welcome back, {user?.firstName || user?.email}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4"> 
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span> 
              </button>
              {lastUpdated && (
                <span className="text-xs text-secondary-500 hidden md:inline"> 
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap"> 
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> 
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Link key={stat.title} to={stat.link}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md hover:border-primary-300 transition-all duration-200 cursor-pointer flex flex-col justify-between" // Added flex classes
                    >
                      <div className="flex items-center justify-between mb-2"> 
                        <div>
                          <p className="text-sm font-medium text-secondary-600 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-secondary-900">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}> {/* Added flex-shrink-0 */}
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                       <p className={`text-sm mt-1 ${
                            stat.title === 'Pending Reviews' && stat.value > 0 ? 'text-red-600' :
                            (stat.title === 'Messages' && stats.unreadMessages > 0) || (stat.title === 'Notifications' && stats.unreadNotifications > 0) ? 'text-orange-600' :
                            'text-green-600' 
                          }`}>
                            {stat.change}
                       </p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
              {/* --- ADJUSTED GRID COLUMNS HERE --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Link
                  to="/admin/applicants"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-secondary-200 hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                >
                  <UserCheck className="w-5 h-5 text-primary-600 flex-shrink-0"/>
                  <span className="text-sm font-medium text-secondary-700 truncate">Review Applications</span>
                </Link>
                <Link
                  to="/admin/universities"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-secondary-200 hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                >
                  <GraduationCap className="w-5 h-5 text-primary-600 flex-shrink-0"/>
                  <span className="text-sm font-medium text-secondary-700 truncate">Manage Universities</span>
                </Link>
                <Link
                  to="/admin/messages"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-secondary-200 hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                >
                  <MessageSquare className="w-5 h-5 text-primary-600 flex-shrink-0"/>
                  <span className="text-sm font-medium text-secondary-700 truncate">View Messages</span>
                </Link>
                <Link
                  to="/admin/notifications"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-secondary-200 hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                >
                  <Bell className="w-5 h-5 text-primary-600 flex-shrink-0"/>
                  <span className="text-sm font-medium text-secondary-700 truncate">View Notifications</span>
                  {stats.unreadNotifications > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {stats.unreadNotifications}
                    </span>
                  )}
                </Link>
              </div>
            </motion.div>

            {/* Recent Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary-600" />
                  Recent Notifications
                </h2>
                <Link
                  to="/admin/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex-shrink-0" 
                >
                  View All
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No Notifications</h3>
                  <p className="text-secondary-600">System notifications will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-secondary-200">
                  {notifications.slice(0, 5).map((notification) => {
                    const isUnread = notification.status === 'SENT' || notification.status === 'PENDING';

                    return (
                      <Link
                        key={notification.notificationId || notification.id}
                        to="/admin/notifications"
                        className={`block p-4 transition-colors duration-200 ${
                          isUnread
                            ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                            : 'hover:bg-secondary-50 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                           <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ 
                             isUnread ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                           }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`text-sm font-medium ${
                                isUnread ? 'text-blue-900' : 'text-secondary-900'
                              }`}>
                                {notification.subject || notification.title || 'System Notification'}
                              </h4>
                              {isUnread && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0"> {/* Added flex-shrink-0 */}
                                  New
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 line-clamp-2 ${ 
                              isUnread ? 'text-blue-800' : 'text-secondary-600'
                            }`}>
                              {notification.message || 'No message available'}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-secondary-500">
                                {new Date(notification.sentAt || notification.createdAt).toLocaleString()}
                              </p>
                              {notification.type && (
                                <span className="text-xs px-2 py-0.5 rounded bg-secondary-100 text-secondary-600">
                                  {notification.type.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
