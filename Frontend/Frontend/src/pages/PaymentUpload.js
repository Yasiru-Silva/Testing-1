import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';
import { paymentsAPI, applicationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentUpload = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user, isStudent } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    slipFile: null,
    amount: '',
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isStudent() && user?.studentId && applicationId) {
      loadApplication();
    }
  }, [applicationId, user, isStudent]);

  const loadApplication = async () => {
    try {
      const response = await applicationsAPI.getById(applicationId);
      setApplication(response.data);
    } catch (error) {
      console.error('Error loading application:', error);
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentData.slipFile) {
      newErrors.slipFile = 'Payment slip is required';
    }
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!paymentData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }
    
    if (!paymentData.transactionReference) {
      newErrors.transactionReference = 'Transaction reference is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Debug: Check token
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      if (!token) {
        toast.error('You are not logged in. Please login again.');
        navigate('/login');
        return;
      }
      
      // Build FormData for file upload + JSON part
      const paymentPayload = {
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        transactionReference: paymentData.transactionReference,
        notes: paymentData.notes,
        application: { applicationId: parseInt(applicationId) }
      };

      console.log('📦 Payment payload:', paymentPayload);

      const formData = new FormData();
      formData.append('payment', JSON.stringify(paymentPayload));
      if (paymentData.slipFile) {
        formData.append('slipFile', paymentData.slipFile);
        console.log('📎 File attached:', paymentData.slipFile.name);
      }

      console.log('🚀 Submitting payment...');
      const response = await paymentsAPI.create(formData);
      console.log('✅ Upload success:', response);
      
      toast.success('Payment slip uploaded successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Error uploading payment:', error);
      console.error('Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      if (error.response?.status === 401) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || '';
        console.error('401 Error message:', errorMsg);
        
        // Only logout if token is actually expired or invalid
        if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid token')) {
          toast.error('Your session has expired. Please login again.');
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }, 2000);
        } else {
          // Token exists but request failed - show error without logging out
          toast.error('Authentication error: ' + errorMsg);
        }
      } else {
        const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to upload payment slip';
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-secondary-900">Upload Payment Slip</h1>
          <p className="text-secondary-600 mt-2">Upload your payment slip for application processing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Application Details
              </h3>
              {application && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-secondary-600">Application ID</label>
                    <p className="font-medium">#{application.applicationId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-600">Program</label>
                    <p className="font-medium">{application.program?.programName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-600">University</label>
                    <p className="font-medium">{application.university?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-600">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      application.applicationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      application.applicationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      application.applicationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {application.applicationStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                Payment Information
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Slip Upload */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Slip * (PDF, JPG, PNG - Max 10MB)
                  </label>
                  <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200">
                    <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                    <input
                      type="file"
                      name="slipFile"
                      onChange={handleInputChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="slip-upload"
                    />
                    <label htmlFor="slip-upload" className="cursor-pointer">
                      <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
                    </label>
                    <p className="text-sm text-secondary-500 mt-1">
                      {paymentData.slipFile ? paymentData.slipFile.name : 'No file selected'}
                    </p>
                  </div>
                  {errors.slipFile && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.slipFile}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Amount * (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Western Union">Western Union</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.paymentMethod}
                    </p>
                  )}
                </div>

                {/* Transaction Reference */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Transaction Reference *
                  </label>
                  <input
                    type="text"
                    name="transactionReference"
                    value={paymentData.transactionReference}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter transaction reference number"
                  />
                  {errors.transactionReference && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.transactionReference}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={paymentData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Any additional information about your payment..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Payment Slip
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentUpload;









