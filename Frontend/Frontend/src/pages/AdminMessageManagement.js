import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  Search,
  Filter,
  Eye,
  Reply,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  Mail,
  Phone,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { contactAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminMessageManagement = () => {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (isAdmin()) {
      loadMessages();
    }
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll();
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await contactAPI.markAsRead(messageId);
      toast.success('Message marked as read');
      loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Failed to mark message as read');
    }
  };

  const handleRespond = async (messageId) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await contactAPI.update(messageId, {
        responseContent: responseText,
        admin: { adminId: user?.adminId || 1 } // You might need to adjust this based on your auth structure
      });
      toast.success('Response sent successfully');
      setResponseText('');
      setShowModal(false);
      loadMessages();
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await contactAPI.delete(messageId);
        toast.success('Message deleted successfully');
        loadMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'GENERAL_INQUIRY': return 'bg-blue-100 text-blue-800';
      case 'PROGRAM_INFO': return 'bg-green-100 text-green-800';
      case 'APPLICATION_HELP': return 'bg-purple-100 text-purple-800';
      case 'SCHOLARSHIP_INFO': return 'bg-yellow-100 text-yellow-800';
      case 'PAYMENT_ISSUE': return 'bg-red-100 text-red-800';
      case 'TECHNICAL_SUPPORT': return 'bg-indigo-100 text-indigo-800';
      case 'COMPLAINT': return 'bg-red-100 text-red-800';
      case 'FEEDBACK': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.messageContent?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || message.messageType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'UNREAD' && !message.isRead) ||
      (statusFilter === 'READ' && message.isRead) ||
      (statusFilter === 'RESPONDED' && message.isResponded);
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Message Management</h1>
                <p className="text-secondary-600">View and respond to customer messages</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadMessages}
                className="flex items-center space-x-2 px-3 py-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                {user?.role || 'ADMIN'}
              </span>
            </div>
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
                  placeholder="Search by name, email, subject, or message content..."
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
                <option value="GENERAL_INQUIRY">General Inquiry</option>
                <option value="PROGRAM_INFO">Program Info</option>
                <option value="APPLICATION_HELP">Application Help</option>
                <option value="SCHOLARSHIP_INFO">Scholarship Info</option>
                <option value="PAYMENT_ISSUE">Payment Issue</option>
                <option value="TECHNICAL_SUPPORT">Technical Support</option>
                <option value="COMPLAINT">Complaint</option>
                <option value="FEEDBACK">Feedback</option>
                <option value="OTHER">Other</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
                <option value="RESPONDED">Responded</option>
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
                Messages ({filteredMessages.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredMessages.map((message) => (
                    <motion.tr
                      key={message.messageId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-secondary-50 transition-colors duration-200 ${!message.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">
                              {message.name}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {message.email}
                            </div>
                            {message.phoneNumber && (
                              <div className="text-xs text-secondary-400">
                                {message.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMessageTypeColor(message.messageType)}`}>
                          {message.messageType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-secondary-900 max-w-xs truncate">
                          {message.subject || 'No subject'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {!message.isRead && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Unread
                            </span>
                          )}
                          {message.isResponded && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Responded
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMessage(message);
                              setShowModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!message.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(message.messageId)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Mark as Read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(message.messageId)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">Message Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-secondary-50 rounded-lg p-4">
                  <h4 className="font-semibold text-secondary-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-secondary-600">Name</label>
                      <p className="font-medium">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-600">Email</label>
                      <p className="font-medium">{selectedMessage.email}</p>
                    </div>
                    {selectedMessage.phoneNumber && (
                      <div>
                        <label className="text-sm text-secondary-600">Phone</label>
                        <p className="font-medium">{selectedMessage.phoneNumber}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-secondary-600">Message Type</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMessageTypeColor(selectedMessage.messageType)}`}>
                        {selectedMessage.messageType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="bg-secondary-50 rounded-lg p-4">
                  <h4 className="font-semibold text-secondary-900 mb-3">Message</h4>
                  <div className="space-y-3">
                    {selectedMessage.subject && (
                      <div>
                        <label className="text-sm text-secondary-600">Subject</label>
                        <p className="font-medium">{selectedMessage.subject}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-secondary-600">Content</label>
                      <p className="text-sm text-secondary-700 whitespace-pre-wrap">{selectedMessage.messageContent}</p>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-600">Sent Date</label>
                      <p className="text-sm text-secondary-700">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Response Section */}
                {selectedMessage.responseContent ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-secondary-900 mb-3">Admin Response</h4>
                    <p className="text-sm text-secondary-700 whitespace-pre-wrap">{selectedMessage.responseContent}</p>
                    <p className="text-xs text-secondary-500 mt-2">
                      Responded on: {new Date(selectedMessage.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-secondary-900 mb-3">Send Response</h4>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Type your response here..."
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleRespond(selectedMessage.messageId)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Send Response</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminMessageManagement;















