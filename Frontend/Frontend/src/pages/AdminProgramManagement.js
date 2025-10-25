import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  Building2,
  DollarSign,
  Clock,
  BookOpen,
  X,
  Save,
  AlertCircle,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { programsAPI, universitiesAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminProgramManagement = () => {
  const { user, isAdmin } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [formData, setFormData] = useState({
    programName: '',
    degreeType: 'UNDERGRADUATE',
    durationYears: '',
    tuitionFeeUsd: '',
    description: '',
    status: 'ACTIVE',
    universityId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const degreeTypes = ['UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE'];
  const statuses = ['ACTIVE', 'INACTIVE'];

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [programsRes, universitiesRes] = await Promise.all([
        programsAPI.getAll(),
        universitiesAPI.getAll()
      ]);
      setPrograms(programsRes.data || []);
      setUniversities(universitiesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.programName.trim()) errors.programName = 'Program name is required';
    if (!formData.universityId) errors.universityId = 'Please select a university';
    if (!formData.durationYears || formData.durationYears <= 0) {
      errors.durationYears = 'Duration must be greater than 0';
    }
    if (!formData.tuitionFeeUsd || formData.tuitionFeeUsd < 0) {
      errors.tuitionFeeUsd = 'Tuition fee must be 0 or greater';
    }
    if (!formData.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentProgram(null);
    setFormData({
      programName: '',
      degreeType: 'UNDERGRADUATE',
      durationYears: '',
      tuitionFeeUsd: '',
      description: '',
      status: 'ACTIVE',
      universityId: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (program) => {
    setIsEditing(true);
    setCurrentProgram(program);
    setFormData({
      programName: program.programName || '',
      degreeType: program.degreeType || 'UNDERGRADUATE',
      durationYears: program.durationYears || '',
      tuitionFeeUsd: program.tuitionFeeUsd || '',
      description: program.description || '',
      status: program.status || 'ACTIVE',
      universityId: program.university?.universityId || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const programData = {
        ...formData,
        university: { universityId: parseInt(formData.universityId) }
      };

      if (isEditing && currentProgram) {
        await programsAPI.update(currentProgram.programId, programData);
        toast.success('Program updated successfully!');
      } else {
        await programsAPI.create(programData);
        toast.success('Program created successfully!');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving program:', error);
      if (error.response?.status === 400) {
        toast.error('A program with this name already exists for this university');
      } else {
        toast.error('Failed to save program');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (program) => {
    if (!window.confirm(`Are you sure you want to delete "${program.programName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await programsAPI.delete(program.programId);
      toast.success('Program deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error('Failed to delete program. It may have associated applications.');
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = 
      program.programName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.university?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUniversity = !universityFilter || program.university?.universityId === parseInt(universityFilter);
    const matchesDegree = !degreeFilter || program.degreeType === degreeFilter;
    const matchesStatus = !statusFilter || program.status === statusFilter;
    return matchesSearch && matchesUniversity && matchesDegree && matchesStatus;
  });

  const getUniversityName = (universityId) => {
    const uni = universities.find(u => u.universityId === universityId);
    return uni ? uni.name : 'Unknown';
  };

  const getDegreeTypeBadge = (type) => {
    const badges = {
      UNDERGRADUATE: 'bg-blue-100 text-blue-800 border-blue-300',
      POSTGRADUATE: 'bg-purple-100 text-purple-800 border-purple-300',
      DOCTORATE: 'bg-indigo-100 text-indigo-800 border-indigo-300'
    };
    return badges[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusBadge = (status) => {
    return status === 'ACTIVE' 
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
          <p className="text-secondary-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
                <p className="text-gray-600 mt-1">Manage academic programs and courses</p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add Program</span>
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs by name, description, or university..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by University
              </label>
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Universities</option>
                {universities.map(uni => (
                  <option key={uni.universityId} value={uni.universityId}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Filter by Degree Type
              </label>
              <select
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Degree Types</option>
                {degreeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
        >
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Programs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{programs.length}</p>
              </div>
              <GraduationCap className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Programs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {programs.filter(p => p.status === 'ACTIVE').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Search Results</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{filteredPrograms.length}</p>
              </div>
              <Search className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Universities</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{universities.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-pink-500 opacity-20" />
            </div>
          </div>
        </motion.div>

        {/* Programs Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || universityFilter || degreeFilter || statusFilter ? 'No programs found' : 'No programs yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || universityFilter || degreeFilter || statusFilter 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first program'}
            </p>
            {!searchTerm && !universityFilter && !degreeFilter && !statusFilter && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add First Program</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      Degree Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      Tuition (USD)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPrograms.map((program, index) => (
                    <motion.tr
                      key={program.programId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-purple-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{program.programName}</div>
                          <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {program.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Building2 className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">{program.university?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDegreeTypeBadge(program.degreeType)}`}>
                          {program.degreeType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span>{program.durationYears} years</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-semibold">{program.tuitionFeeUsd?.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(program.status)}`}>
                          {program.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(program)}
                            className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all transform hover:scale-110"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(program)}
                            className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all transform hover:scale-110"
                            title="Delete"
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
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-6 h-6" />
                  <h2 className="text-xl font-bold">
                    {isEditing ? 'Edit Program' : 'Add New Program'}
                  </h2>
                </div>
                <button
                  onClick={() => !submitting && setShowModal(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Program Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Program Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="programName"
                    value={formData.programName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                      formErrors.programName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Computer Science"
                    disabled={submitting}
                  />
                  {formErrors.programName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formErrors.programName}</span>
                    </p>
                  )}
                </div>

                {/* University Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    University <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="universityId"
                    value={formData.universityId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                      formErrors.universityId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={submitting}
                  >
                    <option value="">Select a university</option>
                    {universities.map(uni => (
                      <option key={uni.universityId} value={uni.universityId}>
                        {uni.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.universityId && (
                    <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formErrors.universityId}</span>
                    </p>
                  )}
                </div>

                {/* Degree Type and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Degree Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="degreeType"
                      value={formData.degreeType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      disabled={submitting}
                    >
                      {degreeTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      disabled={submitting}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration and Tuition */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="durationYears"
                      value={formData.durationYears}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                        formErrors.durationYears ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 4"
                      disabled={submitting}
                    />
                    {formErrors.durationYears && (
                      <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.durationYears}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tuition Fee (USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="tuitionFeeUsd"
                      value={formData.tuitionFeeUsd}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                        formErrors.tuitionFeeUsd ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 10000"
                      disabled={submitting}
                    />
                    {formErrors.tuitionFeeUsd && (
                      <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.tuitionFeeUsd}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter a detailed description of the program..."
                    disabled={submitting}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formErrors.description}</span>
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{isEditing ? 'Update' : 'Create'} Program</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProgramManagement;

