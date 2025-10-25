import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Filter,
  RefreshCw,
  Mail,
  MailOpen,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const StudentNotifications = () => {
  const { user, isStudent } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    if (isStudent() && (user?.studentId || user?.userId)) {
      loadNotifications();
    }
  }, [user, isStudent]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const studentId = user?.studentId || user?.userId;
      const response = await notificationsAPI.getStudentNotifications(studentId);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
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
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        n => n.status === 'SENT' || n.status === 'PENDING'
      );
      
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

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.filter(notif => 
          (notif.notificationId || notif.id) !== notificationId
        )
      );
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter(n => n.status === 'SENT' || n.status === 'PENDING');
    } else if (filter === 'read') {
      return notifications.filter(n => n.status === 'READ');
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => n.status === 'SENT' || n.status === 'PENDING').length;

  if (!isStudent()) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
          <p className="text-secondary-600">You don't have permission to access this page.</p>
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Notifications</h1>
                <p className="text-secondary-600">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark All Read</span>
                </button>
              )}
              <button
                onClick={loadNotifications}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                filter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                filter === 'unread'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                filter === 'read'
                  ? 'border-blue-600 text-blue-600'
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center"
          >
            <Bell className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Notifications</h3>
            <p className="text-secondary-600">
              {filter === 'unread' && 'You have no unread notifications.'}
              {filter === 'read' && 'You have no read notifications.'}
              {filter === 'all' && "You don't have any notifications yet."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => {
              const isUnread = notification.status === 'SENT' || notification.status === 'PENDING';
              const notifId = notification.notificationId || notification.id;

              return (
                <motion.div
                  key={notifId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${
                    isUnread
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-secondary-200 hover:shadow-md'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isUnread ? 'bg-blue-100' : 'bg-secondary-100'
                        }`}>
                          {isUnread ? (
                            <Mail className="w-5 h-5 text-blue-600" />
                          ) : (
                            <MailOpen className="w-5 h-5 text-secondary-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={`text-base font-semibold ${
                              isUnread ? 'text-blue-900' : 'text-secondary-900'
                            }`}>
                              {notification.subject || notification.title || 'Notification'}
                            </h3>
                            {isUnread && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mb-3 ${
                            isUnread ? 'text-blue-800' : 'text-secondary-600'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-secondary-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(notification.sentAt || notification.createdAt).toLocaleString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded ${
                              isUnread ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {isUnread ? 'Unread' : 'Read'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {isUnread && (
                          <button
                            onClick={() => markAsRead(notifId)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notifId)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;


