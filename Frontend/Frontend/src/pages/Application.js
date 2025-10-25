import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Upload,
  Send,
  GraduationCap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { universitiesAPI, programsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Application = () => {
  const [searchParams] = useSearchParams();
  const { user, isStudent } = useAuth();
  const program = searchParams.get('program');
  const universityId = searchParams.get('university');
  
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: '',
    gender: '',
    country: '',
    address: '',
    program: program || '',
    university: universityId || '',
    cv: null,
    motivationLetter: '',
    applicationType: 'UNDERGRADUATE'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load universities and programs on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load programs when university changes
  useEffect(() => {
    if (formData.university) {
      loadPrograms(formData.university);
    }
  }, [formData.university]);

  const loadData = async () => {
    try {
      setLoading(true);
      const universitiesResponse = await universitiesAPI.getAll();
      setUniversities(universitiesResponse.data || []);
      
      // Set selected university if coming from URL
      if (universityId) {
        const university = universitiesResponse.data?.find(u => u.universityId === parseInt(universityId));
        setSelectedUniversity(university);
        if (university) {
          loadPrograms(universityId);
        }
      }
    } catch (error) {
      console.error('Error loading universities:', error);
      toast.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async (universityId) => {
    try {
      const programsResponse = await programsAPI.getByUniversity(universityId);
      setPrograms(programsResponse.data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
      toast.error('Failed to load programs');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    // If university changes, clear program selection
    if (name === 'university') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        program: '' // Clear program when university changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: files ? files[0] : value
      }));
    }
    
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

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.program) newErrors.program = 'Program selection is required';
    if (!formData.university) newErrors.university = 'University selection is required';
    if (!formData.cv) newErrors.cv = 'CV upload is required';
    if (!formData.motivationLetter.trim()) newErrors.motivationLetter = 'Motivation letter is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate required IDs
      if (!formData.university || !formData.program) {
        toast.error('Please select both university and program');
        return;
      }

      // Validate user is logged in
      if (!user || !user.studentId) {
        toast.error('You must be logged in as a student to submit an application');
        return;
      }

      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      // Upload CV file first if provided
      let cvFilePath = null;
      if (formData.cv) {
        toast.loading('Uploading CV...');
        try {
          const cvFormData = new FormData();
          cvFormData.append('file', formData.cv);
          
          const cvUploadResponse = await fetch('/api/files/upload-cv', {
            method: 'POST',
            body: cvFormData,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!cvUploadResponse.ok) {
            const errorData = await cvUploadResponse.json();
            throw new Error(errorData.error || 'CV upload failed');
          }

          const cvData = await cvUploadResponse.json();
          cvFilePath = cvData.filePath;
          console.log('CV uploaded successfully:', cvFilePath);
          toast.dismiss();
          toast.success('CV uploaded successfully!');
        } catch (cvError) {
          console.error('CV upload error:', cvError);
          toast.dismiss();
          toast.error('Failed to upload CV: ' + cvError.message);
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare application data
      const applicationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        country: formData.country,
        address: formData.address,
        applicationType: formData.applicationType,
        cvFilePath: cvFilePath, // Use the uploaded file path
        motivationLetter: formData.motivationLetter,
        studentId: user.studentId, // Use actual logged-in user's student ID
        universityId: parseInt(formData.university),
        programId: parseInt(formData.program)
      };

      console.log('Submitting application data:', applicationData);
      console.log('Current user:', user);
      console.log('Token exists:', !!token);
      
      const response = await applicationsAPI.create(applicationData);
      console.log('Application submitted successfully:', response.data);
      toast.success('Application submitted successfully! You will receive a confirmation email shortly.');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to submit application. Please try again.';
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please refresh the page and try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Check if user is a student
  if (!isStudent()) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
          <p className="text-secondary-600">You need to be logged in as a student to access this page.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-secondary-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
              Thank you for your application. We have received your information and will review it carefully. 
              You will receive a confirmation email shortly.
            </p>
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-600">1</span>
                  </div>
                  <span className="text-secondary-600">Application review and verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-600">2</span>
                  </div>
                  <span className="text-secondary-600">Document verification and processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-600">3</span>
                  </div>
                  <span className="text-secondary-600">Interview scheduling (if required)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-600">4</span>
                  </div>
                  <span className="text-secondary-600">Final decision and next steps</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.div
            variants={itemVariants}
            className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FileText className="w-8 h-8 text-primary-600" />
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4"
          >
            University Application
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-secondary-600 max-w-2xl mx-auto"
          >
            Complete your application to start your journey towards world-class education.
          </motion.p>
        </motion.div>

        {/* Selected Program/University */}
        {(program || selectedUniversity) && (
          <motion.div
            variants={itemVariants}
            className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Selected Program</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                {program && <p className="font-medium text-secondary-900">{program}</p>}
                {selectedUniversity && (
                  <p className="text-secondary-600">{selectedUniversity.name}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Application Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Phone Number *
                  </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`input-field ${errors.phoneNumber ? 'border-red-500' : ''}`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phoneNumber}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`input-field ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`input-field ${errors.gender ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.gender}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Application Type *
                  </label>
                  <select
                    name="applicationType"
                    value={formData.applicationType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="UNDERGRADUATE">Undergraduate</option>
                    <option value="GRADUATE">Graduate</option>
                    <option value="PHD">PhD</option>
                    <option value="CERTIFICATE">Certificate</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`input-field ${errors.country ? 'border-red-500' : ''}`}
                    placeholder="Enter your country"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Academic Information */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    University *
                  </label>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className={`input-field ${errors.university ? 'border-red-500' : ''}`}
                    disabled={loading}
                  >
                    <option value="">Select university</option>
                    {universities.map((university) => (
                      <option key={university.universityId} value={university.universityId}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                  {errors.university && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.university}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Program *
                  </label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    className={`input-field ${errors.program ? 'border-red-500' : ''}`}
                    disabled={!formData.university || loading}
                  >
                    <option value="">Select program</option>
                    {programs.map((program) => (
                      <option key={program.programId} value={program.programId}>
                        {program.programName}
                      </option>
                    ))}
                  </select>
                  {errors.program && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.program}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Documents */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary-600" />
                Required Documents
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    CV/Resume * (PDF, DOC, DOCX - Max 5MB)
                  </label>
                  <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200">
                    <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                    <input
                      type="file"
                      name="cv"
                      onChange={handleInputChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="cv-upload"
                    />
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
                    </label>
                    <p className="text-sm text-secondary-500 mt-1">
                      {formData.cv ? formData.cv.name : 'No file selected'}
                    </p>
                  </div>
                  {errors.cv && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cv}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Motivation Letter *
                  </label>
                  <textarea
                    name="motivationLetter"
                    value={formData.motivationLetter}
                    onChange={handleInputChange}
                    rows={6}
                    className={`input-field ${errors.motivationLetter ? 'border-red-500' : ''}`}
                    placeholder="Explain your motivation for studying this program and your future goals..."
                  />
                  {errors.motivationLetter && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.motivationLetter}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
              <p className="text-sm text-secondary-500 text-center mt-4">
                By submitting this application, you agree to our terms and conditions.
              </p>
            </motion.div>
          </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Application;

