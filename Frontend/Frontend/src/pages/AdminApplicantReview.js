import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  AlertCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import { applicationsAPI, studentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminApplicantReview = () => {
  const { user, isAdmin } = useAuth();
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Wait until auth is initialized and user is an admin
    if (isAdmin()) {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load real Application entities
      const appsResp = await applicationsAPI.getAllApplications();
      let appsRaw = appsResp.data;
      let apps = Array.isArray(appsRaw) ? appsRaw : (appsRaw?.content || appsRaw?.data || []);

      // Fallback: if no applications or API returns empty, try students-with-applications
      if (!Array.isArray(apps) || apps.length === 0) {
        try {
          const fallbackResp = await applicationsAPI.getAll(); // /students/applications
          const studentsRaw = fallbackResp.data;
          const studentsWithApps = Array.isArray(studentsRaw) ? studentsRaw : (studentsRaw?.content || studentsRaw?.data || []);
          // Map student records to an application-like shape for display
          apps = studentsWithApps.map(s => ({
            applicationId: s.applicationId, // may be undefined
            applicationStatus: s.applicationStatus,
            applicationDate: s.applicationDate,
            student: s,
            program: s.program,
            university: s.university,
          }));
        } catch (fallbackErr) {
          console.warn('Fallback load (students/applications) failed:', fallbackErr?.response?.status, fallbackErr?.response?.data || fallbackErr?.message);
        }
      }

      setApplications(apps || []);
      const derivedStudents = (apps || [])
        .map(a => a.student)
        .filter(Boolean);
      setStudents(derivedStudents);
    } catch (error) {
      console.error('Error loading data:', error?.response?.status, error?.response?.data || error?.message);
      toast.error('Failed to load applicant data');
    } finally {
      setLoading(false);
    }
  };

  const getStudentInfo = (studentId) => {
    return students.find(student => student.studentId === studentId) || {};
  };

  // Filter applications based on search and status
  const filteredApplications = applications.filter(application => {
    const student = application.student || {};
    const matchesSearch = !searchTerm || 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.program?.programName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.university?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || application.applicationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'APPROVED': return 'bg-green-100 text-green-800 border border-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 border border-red-300';
      case 'DOCUMENTS_REQUIRED': return 'bg-orange-100 text-orange-800 border border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
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

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      if (applicationId) {
        await applicationsAPI.updateApplicationStatus(applicationId, newStatus);
      } else if (selectedApplication?.student?.studentId) {
        await applicationsAPI.updateStatus(selectedApplication.student.studentId, newStatus);
      } else {
        throw new Error('Missing identifiers to update status');
      }
      toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      loadData(); // Reload data
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error?.response?.status, error?.response?.data || error?.message);
      toast.error('Failed to update application status');
    }
  };



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
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Applicant Review</h1>
                <p className="text-secondary-600">Review and manage student applications</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
        <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-secondary-700 mb-2">Search Applications</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">Filter by Status</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border-2 border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DOCUMENTS_REQUIRED">Documents Required</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-secondary-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-secondary-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-secondary-900 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  Applications ({filteredApplications.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {filteredApplications.filter(a => a.applicationStatus === 'PENDING').length} Pending
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {filteredApplications.filter(a => a.applicationStatus === 'APPROVED').length} Approved
                  </span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-secondary-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredApplications.map((application) => {
                    const StatusIcon = getStatusIcon(application.applicationStatus);
                    
                    return (
                      <motion.tr
                        key={application.applicationId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-blue-50 transition-all duration-200 border-b border-secondary-100"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-secondary-900">
                                {application.student?.firstName} {application.student?.lastName}
                              </div>
                              <div className="text-xs text-secondary-500 flex items-center mt-1">
                                <Mail className="w-3 h-3 mr-1" />
                                {application.student?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {application.program?.programName || 'N/A'}
                          </div>
                          <div className="text-xs text-secondary-500 flex items-center mt-1">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {application.university?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(application.applicationStatus)}`}>
                            <StatusIcon className="w-4 h-4 mr-1.5" />
                            {application.applicationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 font-medium">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-secondary-400" />
                            {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowModal(true);
                              }}
                              className="group relative inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                              <span className="ml-2 text-sm font-medium">View</span>
                            </button>
                            {application.applicationStatus === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(application.applicationId, 'APPROVED')}
                                  className="group relative inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                  title="Approve Application"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="ml-2 text-sm font-medium">Approve</span>
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application.applicationId, 'REJECTED')}
                                  className="group relative inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                  title="Reject Application"
                                >
                                  <XCircle className="w-5 h-5" />
                                  <span className="ml-2 text-sm font-medium">Reject</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'ALL' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'No applications have been submitted yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8"
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-5 rounded-t-2xl border-b-4 border-blue-700 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Application Details</h3>
                    <p className="text-blue-100 text-sm">Complete application information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 transform hover:scale-110"
                  title="Close"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">

              <div className="space-y-6">
                {/* Student Information */}
                <div className="bg-secondary-50 rounded-lg p-4">
                  <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary-600" />
                    Student Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Full Name</label>
                      <p className="font-medium text-secondary-900">
                        {selectedApplication.firstName || selectedApplication.student?.firstName} {selectedApplication.lastName || selectedApplication.student?.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Email</label>
                      <p className="font-medium text-secondary-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-secondary-400" />
                        {selectedApplication.email || selectedApplication.student?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Phone</label>
                      <p className="font-medium text-secondary-900 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-secondary-400" />
                        {selectedApplication.phoneNumber || selectedApplication.student?.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Gender</label>
                      <p className="font-medium text-secondary-900">
                        {selectedApplication.gender || selectedApplication.student?.gender || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Date of Birth</label>
                      <p className="font-medium text-secondary-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-secondary-400" />
                        {selectedApplication.dateOfBirth || selectedApplication.student?.dateOfBirth ? 
                          new Date(selectedApplication.dateOfBirth || selectedApplication.student?.dateOfBirth).toLocaleDateString() : 
                          'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Nationality</label>
                      <p className="font-medium text-secondary-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-secondary-400" />
                        {selectedApplication.nationality || selectedApplication.student?.nationality || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Application Information */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                    Application Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Program</label>
                      <p className="font-medium text-secondary-900">
                        {selectedApplication.program?.programName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">University</label>
                      <p className="font-medium text-secondary-900">
                        {selectedApplication.university?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Application Type</label>
                      <p className="font-medium text-secondary-900">
                        {selectedApplication.applicationType || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.applicationStatus)}`}>
                        {selectedApplication.applicationStatus}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Application Date</label>
                      <p className="font-medium text-secondary-900">
                        {selectedApplication.applicationDate ? 
                          new Date(selectedApplication.applicationDate).toLocaleDateString() : 
                          'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-secondary-600 uppercase">Application ID</label>
                      <p className="font-medium text-secondary-900">
                        #{selectedApplication.applicationId || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Educational Background */}
                {(selectedApplication.previousEducation || selectedApplication.previousEducationCountry || selectedApplication.gpa) && (
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary-600" />
                      Educational Background
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedApplication.previousEducation && (
                        <div>
                          <label className="text-xs text-secondary-600 uppercase">Previous Education</label>
                          <p className="font-medium text-secondary-900">{selectedApplication.previousEducation}</p>
                        </div>
                      )}
                      {selectedApplication.previousEducationCountry && (
                        <div>
                          <label className="text-xs text-secondary-600 uppercase">Country of Study</label>
                          <p className="font-medium text-secondary-900">{selectedApplication.previousEducationCountry}</p>
                        </div>
                      )}
                      {selectedApplication.gpa && (
                        <div>
                          <label className="text-xs text-secondary-600 uppercase">GPA/Grade</label>
                          <p className="font-medium text-secondary-900">{selectedApplication.gpa}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Motivation Letter */}
                {selectedApplication.motivationLetter && (
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <h4 className="font-semibold text-secondary-900 mb-3">Motivation Letter</h4>
                    <p className="text-secondary-700 whitespace-pre-wrap text-sm">
                      {selectedApplication.motivationLetter}
                    </p>
                  </div>
                )}

                {/* CV Document */}
                {selectedApplication.cvFilePath && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      Curriculum Vitae (CV)
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">CV Document</p>
                          <p className="text-sm text-secondary-600">
                            {selectedApplication.cvFilePath.split('/').pop()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`http://localhost:8082${selectedApplication.cvFilePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                      >
                        <Eye className="w-5 h-5" />
                        <span>View CV</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedApplication.applicationStatus === 'PENDING' && (
                  <div className="flex space-x-3 pt-6 border-t-2 border-secondary-200 mt-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.applicationId, 'APPROVED')}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Approve Application</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.applicationId, 'REJECTED')}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Reject Application</span>
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

export default AdminApplicantReview;
