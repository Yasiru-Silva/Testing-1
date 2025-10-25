import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  GraduationCap, 
  MapPin, 
  Clock, 
  DollarSign,
  BookOpen,
  Star,
  ArrowRight,
  Grid,
  List,
  RefreshCw,
  Building2
} from 'lucide-react';
import { programsAPI, universitiesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Programs = () => {
  const [searchParams] = useSearchParams();
  const universityIdParam = searchParams.get('university');
  
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(universityIdParam || '');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadData();
  }, []);

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
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const degreeTypes = ['UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE'];
  const selectedUniversityData = selectedUniversity ? 
    universities.find(u => u.universityId === parseInt(selectedUniversity)) : null;

  const filteredPrograms = programs
    .filter(program => {
      const matchesSearch = (program.programName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (program.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesUniversity = !selectedUniversity || program.university?.universityId === parseInt(selectedUniversity);
      const matchesDegree = !selectedDegree || program.degreeType === selectedDegree;
      const matchesStatus = !selectedStatus || program.status === selectedStatus;
      return matchesSearch && matchesUniversity && matchesDegree && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.programName || '').localeCompare(b.programName || '');
        case 'university':
          return (a.university?.name || '').localeCompare(b.university?.name || '');
        case 'tuition':
          return (a.tuitionFeeUsd || 0) - (b.tuitionFeeUsd || 0);
        default:
          return 0;
      }
    });

  function getDegreeType(programName) {
    const lowerName = programName.toLowerCase();
    if (lowerName.includes('medicine') || lowerName.includes('mbbs')) return 'Medicine';
    if (lowerName.includes('engineering')) return 'Engineering';
    if (lowerName.includes('management') || lowerName.includes('economics')) return 'Business';
    if (lowerName.includes('law')) return 'Law';
    if (lowerName.includes('chemistry') || lowerName.includes('physics') || lowerName.includes('biology')) return 'Science';
    if (lowerName.includes('journalism') || lowerName.includes('languages') || lowerName.includes('philology')) return 'Arts';
    if (lowerName.includes('design') || lowerName.includes('architecture')) return 'Design';
    return 'General';
  }

  function getDuration(programName) {
    const lowerName = programName.toLowerCase();
    if (lowerName.includes('medicine') || lowerName.includes('mbbs')) return '6 years';
    if (lowerName.includes('engineering')) return '4 years';
    if (lowerName.includes('master') || lowerName.includes('postgraduate')) return '2 years';
    return '4 years';
  }

  function getTuition(programName) {
    const lowerName = programName.toLowerCase();
    if (lowerName.includes('medicine') || lowerName.includes('mbbs')) return 4500;
    if (lowerName.includes('engineering')) return 3800;
    if (lowerName.includes('management') || lowerName.includes('economics')) return 3200;
    if (lowerName.includes('law')) return 3000;
    return 3500;
  }

  function getProgramDescription(programName) {
    const lowerName = programName.toLowerCase();
    if (lowerName.includes('medicine') || lowerName.includes('mbbs')) {
      return 'Comprehensive medical education with clinical training and research opportunities.';
    }
    if (lowerName.includes('engineering')) {
      return 'Advanced engineering education with hands-on training and modern laboratory facilities.';
    }
    if (lowerName.includes('management') || lowerName.includes('economics')) {
      return 'Business education focusing on modern management practices and economic principles.';
    }
    if (lowerName.includes('law')) {
      return 'Legal education covering national and international law with practical training.';
    }
    if (lowerName.includes('chemistry') || lowerName.includes('physics') || lowerName.includes('biology')) {
      return 'Scientific education with research opportunities and modern laboratory facilities.';
    }
    return 'Comprehensive academic program with modern curriculum and experienced faculty.';
  }

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

  const ProgramCard = ({ program }) => (
    <motion.div
      variants={itemVariants}
      className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-primary-600" />
        </div>
        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-semibold">
          {program.degreeType}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2">
        {program.programName}
      </h3>

      <div className="flex items-center text-secondary-600 mb-2">
        <Building2 className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">{program.university?.name || 'N/A'}</span>
      </div>

      <div className="flex items-center text-secondary-600 mb-2">
        <MapPin className="w-4 h-4 mr-2" />
        <span className="text-sm">{program.university?.location || 'N/A'}</span>
      </div>

      <p className="text-secondary-600 text-sm mb-4 line-clamp-3">{program.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-secondary-50 rounded-lg">
          <Clock className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
          <p className="text-xs text-secondary-600">Duration</p>
          <p className="text-sm font-medium text-secondary-900">{program.durationYears} years</p>
        </div>
        <div className="text-center p-3 bg-secondary-50 rounded-lg">
          <DollarSign className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
          <p className="text-xs text-secondary-600">Tuition/Year</p>
          <p className="text-sm font-medium text-secondary-900">${program.tuitionFeeUsd?.toLocaleString() || 'N/A'}</p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Link
          to={`/apply?program=${encodeURIComponent(program.programName)}&university=${program.university?.universityId || ''}`}
          className="btn-primary text-sm flex items-center"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </motion.div>
  );

  const ProgramListItem = ({ program }) => (
    <motion.div
      variants={itemVariants}
      className="card hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="w-full md:w-20 aspect-square bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-8 h-8 text-primary-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-secondary-900 flex-1">{program.programName}</h3>
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-semibold">
              {program.degreeType}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-2 text-sm text-secondary-600">
            <div className="flex items-center">
              <Building2 className="w-4 h-4 mr-1" />
              <span>{program.university?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{program.university?.location || 'N/A'}</span>
            </div>
          </div>

          <p className="text-secondary-600 mb-3 line-clamp-2">{program.description}</p>

          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4 mb-2 md:mb-0">
              <div className="flex items-center text-sm text-secondary-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>{program.durationYears} years</span>
              </div>
              <div className="flex items-center text-sm text-secondary-600">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>${program.tuitionFeeUsd?.toLocaleString() || 'N/A'}/year</span>
              </div>
            </div>
            
            <Link
              to={`/apply?program=${encodeURIComponent(program.programName)}&university=${program.university?.universityId || ''}`}
              className="btn-primary text-sm flex items-center"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            Academic Programs
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Explore diverse academic programs across our partner universities and find the perfect 
            program for your career goals.
          </p>
        </motion.div>

        {/* University Selection */}
        {selectedUniversityData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">{selectedUniversityData.name}</h3>
                  <p className="text-secondary-600">{selectedUniversityData.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUniversity('')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Programs
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* University Filter */}
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="input-field"
            >
              <option value="">All Universities</option>
              {universities.map((university) => (
                <option key={university.universityId} value={university.universityId}>
                  {university.name}
                </option>
              ))}
            </select>

            {/* Degree Filter */}
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="input-field"
            >
              <option value="">All Degrees</option>
              {degreeTypes.map((degree) => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="name">Sort by Name</option>
              <option value="university">Sort by University</option>
              <option value="tuition">Sort by Tuition</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-secondary-400 hover:text-secondary-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-secondary-400 hover:text-secondary-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-1 text-sm text-secondary-600">
              <Filter className="w-4 h-4" />
              <span>
                Showing {filteredPrograms.length} of {programs.length} programs
              </span>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
              <p className="text-lg text-secondary-600">Loading programs...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Programs Grid/List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                  : 'space-y-6'
              }
            >
              {filteredPrograms.map((program) =>
                viewMode === 'grid' ? (
                  <ProgramCard key={program.programId} program={program} />
                ) : (
                  <ProgramListItem key={program.programId} program={program} />
                )
              )}
            </motion.div>

            {/* No Results */}
            {filteredPrograms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No programs found</h3>
            <p className="text-secondary-600 mb-6">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedUniversity('');
                setSelectedDegree('');
                setSortBy('name');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
            )}
          </>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Found Your Perfect Program?
            </h2>
            <p className="text-lg mb-6 text-blue-100">
              Start your application process and take the first step towards your dream education.
            </p>
            <Link
              to="/apply"
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <span>Start Application</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Programs;

