import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  Search,
  Filter,
  Eye,
  Trash2,
  UserPlus,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    // Run after auth initializes so token is present and isAdmin can be evaluated
    if (isAdmin()) {
      loadNotifications();
    }
  }, [user, isAdmin]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAdminNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      // Update local state immediately
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          (notif.notificationId === notificationId || notif.id === notificationId)
            ? { ...notif, status: 'READ' }
            : notif
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === 'SENT' || n.status === 'PENDING');
      
      if (unreadNotifications.length === 0) {
        toast.info('No unread notifications');
        return;
      }

      await Promise.all(
        unreadNotifications.map(notif => 
          notificationsAPI.markAsRead(notif.notificationId || notif.id)
        )
      );
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, status: 'READ' }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationsAPI.delete(notificationId);
        toast.success('Notification deleted');
        loadNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Failed to delete notification');
      }
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'USER_SIGNUP': return UserPlus;
      case 'APPLICATION_UPDATE': return FileText;
      case 'PAYMENT_CONFIRMATION': return CreditCard;
      case 'GENERAL': return Bell;
      default: return Bell;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'USER_SIGNUP': return 'bg-green-100 text-green-800';
      case 'APPLICATION_UPDATE': return 'bg-blue-100 text-blue-800';
      case 'PAYMENT_CONFIRMATION': return 'bg-purple-100 text-purple-800';
      case 'GENERAL': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return Clock;
      case 'SENT': return CheckCircle;
      case 'DELIVERED': return CheckCircle;
      case 'FAILED': return XCircle;
      default: return Bell;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || notification.status === statusFilter;
    
    // View filter (all/unread/read)
    const isUnread = notification.status === 'SENT' || notification.status === 'PENDING';
    const matchesView = 
      viewFilter === 'all' || 
      (viewFilter === 'unread' && isUnread) ||
      (viewFilter === 'read' && !isUnread);
    
    return matchesSearch && matchesType && matchesStatus && matchesView;
  });

  const unreadCount = notifications.filter(n => n.status === 'SENT' || n.status === 'PENDING').length;

  // Additional safety check
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
          <p className="text-secondary-600">You don't have admin permissions to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Admin Notifications</h1>
                <p className="text-secondary-600">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark All Read</span>
                </button>
              )}
              <button
                onClick={loadNotifications}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                viewFilter === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setViewFilter('unread')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                viewFilter === 'unread'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setViewFilter('read')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                viewFilter === 'read'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Types</option>
                <option value="USER_SIGNUP">User Signup</option>
                <option value="APPLICATION_UPDATE">Application Update</option>
                <option value="PAYMENT_CONFIRMATION">Payment Confirmation</option>
                <option value="GENERAL">General</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SENT">Sent</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">
                Notifications ({filteredNotifications.length})
              </h2>
            </div>
            
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No Notifications Found</h3>
                <p className="text-secondary-600">No notifications match your search criteria.</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-200">
                {filteredNotifications.map((notification) => {
                  const TypeIcon = getTypeIcon(notification.type);
                  const StatusIcon = getStatusIcon(notification.status);
                  const isUnread = notification.status === 'SENT' || notification.status === 'PENDING';
                  
                  return (
                    <motion.div
                      key={notification.notificationId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 transition-colors duration-200 ${
                        isUnread 
                          ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500' 
                          : 'hover:bg-secondary-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className={`text-sm font-medium ${
                                isUnread ? 'text-blue-900' : 'text-secondary-900'
                              }`}>
                                {notification.subject || 'System Notification'}
                              </h3>
                              {isUnread && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                {notification.type.replace('_', ' ')}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {notification.status}
                              </span>
                            </div>
                            <p className="text-sm text-secondary-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-secondary-500">
                              <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>
                              {notification.deliveredAt && (
                                <span>Delivered: {new Date(notification.deliveredAt).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(notification.notificationId)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                              title="Mark as Read"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.notificationId)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;