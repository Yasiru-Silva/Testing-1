import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  CreditCard, 
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  FileText,
  RefreshCw
} from 'lucide-react';
import { paymentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminPaymentManagement = () => {
  const { user, isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      loadPayments();
    }
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getAll();
      setPayments(response.data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId, newStatus, reason = '') => {
    try {
      await paymentsAPI.updateStatus(paymentId, newStatus, reason);
      toast.success(`Payment ${newStatus.toLowerCase()} successfully`);
      loadPayments();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return Clock;
      case 'APPROVED': return CheckCircle;
      case 'REJECTED': return XCircle;
      default: return CreditCard;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.application?.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.application?.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.application?.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Payment Management</h1>
                <p className="text-secondary-600">Review and manage payment submissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadPayments}
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
                  placeholder="Search by student name, email, or transaction reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
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
                Payments ({filteredPayments.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredPayments.map((payment) => {
                    const StatusIcon = getStatusIcon(payment.status);
                    
                    return (
                      <motion.tr
                        key={payment.paymentId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-secondary-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-secondary-900">
                                {payment.application?.student?.firstName} {payment.application?.student?.lastName}
                              </div>
                              <div className="text-sm text-secondary-500">
                                {payment.application?.student?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-secondary-900">
                              ${payment.amount || '0.00'}
                            </div>
                            {payment.slipFilePath && (
                              <FileText className="w-4 h-4 text-primary-600" title="Has payment slip" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {payment.paymentMethod || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {new Date(payment.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {payment.status === 'PENDING' && (
                            <div className="inline-flex space-x-1">
                              <button
                                onClick={() => handleStatusUpdate(payment.paymentId, 'APPROVED')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:');
                                  if (reason) {
                                    handleStatusUpdate(payment.paymentId, 'REJECTED', reason);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">Payment Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Information */}
                <div className="bg-secondary-50 rounded-lg p-4">
                  <h4 className="font-semibold text-secondary-900 mb-3">Student Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-secondary-600">Name</label>
                      <p className="font-medium">
                        {selectedPayment.application?.student?.firstName} {selectedPayment.application?.student?.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-600">Email</label>
                      <p className="font-medium">{selectedPayment.application?.student?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-secondary-50 rounded-lg p-4">
                  <h4 className="font-semibold text-secondary-900 mb-3">Payment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-secondary-600">Payment ID</label>
                      <p className="font-medium">#{selectedPayment.paymentId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-600">Amount</label>
                      <p className="font-medium">${selectedPayment.amount || '0.00'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-600">Payment Method</label>
                      <p className="font-medium">{selectedPayment.paymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-600">Transaction Reference</label>
                      <p className="font-medium">{selectedPayment.transactionReference || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-600">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm text-secondary-600">Uploaded Date</label>
                      <p className="font-medium">{new Date(selectedPayment.uploadedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Slip / Payment Proof */}
                {selectedPayment.slipFilePath && (
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary-600" />
                      Payment Proof / Bank Slip
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-secondary-200">
                      <img 
                        src={`http://localhost:8080/api/payments/${selectedPayment.paymentId}/slip`}
                        alt="Payment Slip"
                        className="max-w-full h-auto rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-secondary-600">
                          File: {selectedPayment.slipFilePath?.split('/').pop() || 'payment_slip'}
                        </span>
                        <a
                          href={`http://localhost:8080/api/payments/${selectedPayment.paymentId}/slip`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Full Size
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPayment.notes && (
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <h4 className="font-semibold text-secondary-900 mb-3">Notes</h4>
                    <p className="text-sm text-secondary-700">{selectedPayment.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {selectedPayment.status === 'PENDING' && (
                  <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                    <button
                      onClick={() => handleStatusUpdate(selectedPayment.paymentId, 'APPROVED')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Payment</span>
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) {
                          handleStatusUpdate(selectedPayment.paymentId, 'REJECTED', reason);
                        }
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Payment</span>
                    </button>
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

export default AdminPaymentManagement;














