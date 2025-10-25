import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Plus,
  Eye,
  Download,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CreditCard,
  Bell,
  AlertCircle,
  X,
  Building2
} from 'lucide-react';
import { applicationsAPI, notificationsAPI, paymentsAPI, studentsAPI } from '../services/api';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, isStudent } = useAuth();
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isStudent() && (user?.studentId || user?.userId)) {
      // Add a small delay to ensure authentication is fully settled
      const timer = setTimeout(() => {
        loadStudentData();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, isStudent]);

// Auto-refresh data every 5 minutes
  useEffect(() => {
    let intervalId = null;
  
    if (isStudent() && (user?.studentId || user?.userId)) {
      intervalId = setInterval(() => {
        loadStudentData();
      }, 300000); // Refresh every 5 minutes 

      
      return () => {
          if (intervalId) clearInterval(intervalId);
      };
    }
    
  }, [user?.studentId, user?.userId, isStudent]); 

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.notificationId === notificationId || notif.id === notificationId
            ? { ...notif, status: 'READ' }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Ensure applications is always an array
      if (!Array.isArray(applications)) {
        setApplications([]);
      }
      
      if (!user?.studentId && !user?.userId) {
        console.warn('No student ID or user ID found in user context');
        return;
      }
      
      // Use studentId if available, otherwise fall back to userId
      const studentId = user?.studentId || user?.userId;

      // Load student profile
      let profile = null;
      try {
        const profileResponse = await studentsAPI.getById(studentId);
        profile = profileResponse.data;
        setStudentProfile(profile);
      } catch (error) {
        console.warn('Failed to load student profile:', error);
      }

      // Load student applications as a list of Application entities
      let studentApplications = [];
      try {
        const applicationsResponse = await applicationsAPI.getByStudent(studentId);
        const appsRaw = applicationsResponse.data;
        const apps = Array.isArray(appsRaw) ? appsRaw : (appsRaw?.content || appsRaw?.data || (appsRaw ? [appsRaw] : []));
        studentApplications = apps;
        setApplications(studentApplications);
      } catch (error) {
        console.warn('Failed to load applications:', error?.response?.status, error?.response?.data || error?.message);
        // Fallback: load from students-with-applications if Applications endpoint is empty or fails
        try {
          const fallback = await studentsAPI.getById(studentId);
          const studentData = fallback.data;
          if (studentData && studentData.applicationStatus) {
            studentApplications = [studentData];
            setApplications(studentApplications);
          } else {
            setApplications([]);
          }
        } catch (fallbackErr) {
          console.warn('Fallback student-by-id also failed:', fallbackErr?.response?.status, fallbackErr?.response?.data || fallbackErr?.message);
          setApplications([]);
        }
      }

      // Load student notifications
      let studentNotifications = [];
      try {
        const notificationsResponse = await notificationsAPI.getStudentNotifications(studentId);
        studentNotifications = notificationsResponse.data || [];
        setNotifications(studentNotifications);
      } catch (error) {
        console.warn('Failed to load notifications:', error);
      }

      // Load payments for each application
      let allPayments = [];
      try {
        const paymentPromises = studentApplications.map(app => 
          paymentsAPI.getByApplication(app.applicationId).catch(err => {
            console.warn(`Failed to load payments for application ${app.applicationId}:`, err);
            return { data: [] };
          })
        );
        const paymentResponses = await Promise.all(paymentPromises);
        allPayments = paymentResponses.flatMap(response => response.data || []);
        setPayments(allPayments);
      } catch (error) {
        console.warn('Failed to load payments:', error);
      }

    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'DOCUMENTS_REQUIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return Clock;
      case 'SUBMITTED': return FileText;
      case 'APPROVED': return CheckCircle;
      case 'REJECTED': return XCircle;
      case 'DOCUMENTS_REQUIRED': return AlertCircle;
      default: return FileText;
    }
  };

  // Additional safety check
  if (!isStudent()) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
          <p className="text-secondary-600">You don't have student permissions to access this page.</p>
        </div>
      </div>
    );
  }

  // Ensure applications is an array before calculating stats
  const safeApplications = Array.isArray(applications) ? applications : [];
  
  const stats = [
    {
      title: 'Total Applications',
      value: safeApplications.length,
      icon: FileText,
      color: 'bg-blue-500',
      change: safeApplications.length > 0 ? 'Active applications' : 'No applications yet'
    },
    {
      title: 'Pending Review',
      value: safeApplications.filter(app => app.applicationStatus === 'PENDING').length,
      icon: Clock,
      color: 'bg-yellow-500',
      change: safeApplications.filter(app => app.applicationStatus === 'PENDING').length > 0 ? 'Awaiting review' : 'All reviewed'
    },
    {
      title: 'Approved',
      value: safeApplications.filter(app => app.applicationStatus === 'APPROVED').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: safeApplications.filter(app => app.applicationStatus === 'APPROVED').length > 0 ? 'Congratulations!' : 'None yet'
    },
    {
      title: 'Unread Notifications',
      value: notifications.filter(notif => notif.status === 'SENT').length,
      icon: Bell,
      color: 'bg-purple-500',
      change: notifications.filter(notif => notif.status === 'SENT').length > 0 ? 'New updates' : 'All read'
    },
    {
      title: 'Total Payments',
      value: payments.length,
      icon: CreditCard,
      color: 'bg-indigo-500',
      change: payments.length > 0 ? 'Payment history' : 'No payments yet'
    },
    {
      title: 'Pending Payments',
      value: payments.filter(payment => payment.paymentStatus === 'PENDING').length,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: payments.filter(payment => payment.paymentStatus === 'PENDING').length > 0 ? 'Action required' : 'All processed'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Student Dashboard</h1>
                <p className="text-secondary-600">
                  Welcome back, {studentProfile?.firstName || user?.firstName || user?.email}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadStudentData}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              {lastUpdated && (
                <span className="text-xs text-secondary-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                STUDENT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-secondary-900">
                          {stat.value}
                        </p>
                        <p className={`text-sm mt-1 ${
                          stat.title === 'Pending Review' && stat.value > 0 ? 'text-yellow-600' :
                          stat.title === 'Approved' && stat.value > 0 ? 'text-green-600' :
                          stat.title === 'Unread Notifications' && stat.value > 0 ? 'text-orange-600' :
                          stat.title === 'Pending Payments' && stat.value > 0 ? 'text-red-600' :
                          'text-secondary-500'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  to="/apply"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-secondary-200 hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-secondary-700">New Application</span>
                </Link>
                <Link
                  to="/universities"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-secondary-200 hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                >
                  <GraduationCap className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-secondary-700">Browse Universities</span>
                </Link>
                <Link
                  to="/programs"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-secondary-200 hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                >
                  <FileText className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-secondary-700">View Programs</span>
                </Link>
                <Link
                  to="/payment/1"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-secondary-200 hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                >
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-secondary-700">Upload Payment</span>
                </Link>
                <Link
                  to="/student/notifications"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-secondary-200 hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                >
                  <Bell className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-secondary-700">View Notifications</span>
                </Link>
              </div>
            </motion.div>

            {/* All Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900">My Applications</h2>
                  <p className="text-sm text-secondary-600 mt-1">
                    Total: {safeApplications.length} application{safeApplications.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  to="/apply"
                  className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Application</span>
                </Link>
              </div>
              
              {safeApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No Applications Yet</h3>
                  <p className="text-secondary-600 mb-4">Start your study abroad journey by applying to a program.</p>
                  <Link
                    to="/apply"
                    className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Application</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          University
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Applied Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {safeApplications.map((application, index) => {
                        const StatusIcon = getStatusIcon(application.applicationStatus);
                        
                        return (
                          <motion.tr
                            key={application.applicationId || application.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-secondary-50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-secondary-700">
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-secondary-900">
                                {application.program?.programName || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-secondary-900">
                                {application.university?.name || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.applicationStatus)}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {application.applicationStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                              {new Date(application.applicationDate || application.createdAt).toLocaleDateString()}
                            </td>

                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Application Details Modal */}
            {showModal && selectedApplication && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Application Details</h2>
                        <p className="text-primary-100 text-sm">
                          Application ID: #{selectedApplication.applicationId}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedApplication(null);
                      }}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors duration-200 backdrop-blur-sm"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                    <div className="space-y-6">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl border border-secondary-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selectedApplication.applicationStatus === 'APPROVED' ? 'bg-green-100' :
                            selectedApplication.applicationStatus === 'REJECTED' ? 'bg-red-100' :
                            selectedApplication.applicationStatus === 'PENDING' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            {(() => {
                              const StatusIcon = getStatusIcon(selectedApplication.applicationStatus);
                              return <StatusIcon className={`w-6 h-6 ${
                                selectedApplication.applicationStatus === 'APPROVED' ? 'text-green-600' :
                                selectedApplication.applicationStatus === 'REJECTED' ? 'text-red-600' :
                                selectedApplication.applicationStatus === 'PENDING' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`} />;
                            })()}
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600">Application Status</p>
                            <p className={`text-lg font-bold ${getStatusColor(selectedApplication.applicationStatus)}`}>
                              {selectedApplication.applicationStatus}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-secondary-600">Applied On</p>
                          <p className="text-lg font-semibold text-secondary-900">
                            {new Date(selectedApplication.applicationDate || selectedApplication.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Program & University Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Program Details */}
                        <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-secondary-900">Program</h3>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-secondary-600">Program Name</p>
                              <p className="text-base font-medium text-secondary-900">
                                {selectedApplication.program?.programName || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600">Degree Type</p>
                              <p className="text-base font-medium text-secondary-900">
                                {selectedApplication.program?.degreeType || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600">Duration</p>
                              <p className="text-base font-medium text-secondary-900">
                                {selectedApplication.program?.durationYears ? `${selectedApplication.program.durationYears} years` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* University Details */}
                        <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-secondary-900">University</h3>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-secondary-600">University Name</p>
                              <p className="text-base font-medium text-secondary-900">
                                {selectedApplication.university?.name || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-600">Location</p>
                              <p className="text-base font-medium text-secondary-900 flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-secondary-500" />
                                {selectedApplication.university?.location || 'N/A'}
                              </p>
                            </div>
                            {selectedApplication.university?.website && (
                              <div>
                                <p className="text-sm text-secondary-600">Website</p>
                                <a
                                  href={selectedApplication.university.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-base font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                >
                                  Visit Website →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                          <User className="w-5 h-5 mr-2 text-primary-600" />
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-secondary-600">Full Name</p>
                            <p className="text-base font-medium text-secondary-900">
                              {selectedApplication.firstName} {selectedApplication.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600">Email</p>
                            <p className="text-base font-medium text-secondary-900 flex items-center">
                              <Mail className="w-4 h-4 mr-1 text-secondary-500" />
                              {selectedApplication.email}
                            </p>
                          </div>
                          {selectedApplication.phoneNumber && (
                            <div>
                              <p className="text-sm text-secondary-600">Phone Number</p>
                              <p className="text-base font-medium text-secondary-900 flex items-center">
                                <Phone className="w-4 h-4 mr-1 text-secondary-500" />
                                {selectedApplication.phoneNumber}
                              </p>
                            </div>
                          )}
                          {selectedApplication.dateOfBirth && (
                            <div>
                              <p className="text-sm text-secondary-600">Date of Birth</p>
                              <p className="text-base font-medium text-secondary-900 flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-secondary-500" />
                                {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {selectedApplication.gender && (
                            <div>
                              <p className="text-sm text-secondary-600">Gender</p>
                              <p className="text-base font-medium text-secondary-900">
                                {selectedApplication.gender}
                              </p>
                            </div>
                          )}
                          {selectedApplication.country && (
                            <div>
                              <p className="text-sm text-secondary-600">Country</p>
                              <p className="text-base font-medium text-secondary-900">
                                {selectedApplication.country}
                              </p>
                            </div>
                          )}
                          {selectedApplication.address && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-secondary-600">Address</p>
                              <p className="text-base font-medium text-secondary-900">
                                {selectedApplication.address}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Motivation Letter */}
                      {selectedApplication.motivationLetter && (
                        <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm">
                          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Motivation Letter
                          </h3>
                          <div className="bg-secondary-50 rounded-lg p-4">
                            <p className="text-secondary-700 whitespace-pre-wrap">
                              {selectedApplication.motivationLetter}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* CV Document */}
                      {selectedApplication.cvFilePath && (
                        <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm">
                          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            CV Document
                          </h3>
                          <a
                            href={selectedApplication.cvFilePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <Download className="w-5 h-5" />
                            <span className="font-medium">View/Download CV</span>
                          </a>
                        </div>
                      )}

                      {/* Application Type */}
                      {selectedApplication.applicationType && (
                        <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm">
                          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                            Application Type
                          </h3>
                          <p className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {selectedApplication.applicationType}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-secondary-50 px-6 py-4 border-t border-secondary-200 flex items-center justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedApplication(null);
                      }}
                      className="px-4 py-2 text-secondary-700 hover:bg-secondary-200 rounded-lg transition-colors duration-200 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}


            {/* Notifications and Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    to="/student/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No Notifications</h3>
                    <p className="text-secondary-600">You'll receive updates about your applications here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-secondary-200">
                    {notifications.slice(0, 5).map((notification) => {
                      const isUnread = notification.status === 'SENT' || notification.status === 'PENDING';
                      const notifId = notification.notificationId || notification.id;
                      
                      return (
                        <div
                          key={notifId}
                          onClick={() => isUnread && markNotificationAsRead(notifId)}
                          className={`p-4 transition-colors duration-200 ${
                            isUnread 
                              ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer border-l-4 border-blue-500' 
                              : 'hover:bg-secondary-50 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              isUnread ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className={`text-sm font-medium ${
                                  isUnread ? 'text-blue-900' : 'text-secondary-900'
                                }`}>
                                  {notification.subject || notification.title || 'Application Update'}
                                </h4>
                                {isUnread && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm mt-1 ${
                                isUnread ? 'text-blue-800' : 'text-secondary-600'
                              }`}>
                                {notification.message || 'No message available'}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-secondary-500">
                                  {new Date(notification.sentAt || notification.createdAt).toLocaleString()}
                                </p>
                                {isUnread && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    Click to mark as read
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Student Profile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-secondary-200">
                  <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary-600" />
                    Profile Information
                  </h2>
                </div>
                
                <div className="p-6">
                  {studentProfile ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900">
                            {studentProfile.firstName} {studentProfile.lastName}
                          </h3>
                          <p className="text-sm text-secondary-600">{studentProfile.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-secondary-600">Phone:</span>
                          <span className="text-sm text-secondary-900">{studentProfile.phoneNumber || studentProfile.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-secondary-600">Status:</span>
                          <span className="text-sm text-green-600 font-medium">Active Student</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-secondary-600">Member since:</span>
                          <span className="text-sm text-secondary-900">
                            {new Date(studentProfile.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <button className="w-full mt-4 px-4 py-2 text-sm text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors duration-200">
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">Loading Profile...</h3>
                      <p className="text-secondary-600">Please wait while we load your profile information.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
