
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Users,
  Calendar,
  GraduationCap,
  Filter,
  Grid,
  List,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  X // Added X for clear filters button
} from 'lucide-react';
import { universitiesAPI } from '../services/api';
import toast from 'react-hot-toast';

// --- 1. IMPORT LOCAL IMAGES ---
import chuvashAgrarian from '../assets/chuvash agrarian.jpg';
import chuvashPedagogical from '../assets/chuvash pedagogical.jpg';
import kazanInnovative from '../assets/kazan innovative.jpg';
import lobachevsky from '../assets/lobachevsky.jpg';
import samaraNational from '../assets/samara national.jpg';
import yaroslavlTech from '../assets/yaroslavl tech.jpg';
// --- END OF IMAGE IMPORTS ---

const Universities = () => { // <--- This is the component definition
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');

  // --- 2. CREATE IMAGE MAP ---
  // Links API university names to local images. Ensure names match EXACTLY.
  const universityImageMap = {
    'Chuvash State Pedagogical University': chuvashPedagogical,
    'Samara National Research University': samaraNational,
    'Yaroslavl State Technical University (YSTU)': yaroslavlTech,
    'Chuvash State Agrarian University': chuvashAgrarian,
    'Lobachevsky State University of Nizhny Novgorod (UNN)': lobachevsky,
    'Kazan Innovative University': kazanInnovative,
  };
  // --- END OF IMAGE MAP ---

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      const response = await universitiesAPI.getAll(); // Fetch from API
      setUniversities(response.data || []);
    } catch (error) {
      console.error('Error loading universities:', error);
      toast.error('Failed to load universities');
      setUniversities([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const locations = [...new Set(universities.map(uni => uni.location).filter(Boolean))];

  // --- Filtering and Sorting Logic ---
  const filteredUniversities = universities
    .filter(uni => {
      const nameMatch = (uni.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const descMatch = (uni.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const locationMatch = !selectedLocation || uni.location === selectedLocation;
      return (nameMatch || descMatch) && locationMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'students':
          const parseStudents = (s) => parseInt((s || '0').replace(/\D/g, ''), 10) || 0;
          return parseStudents(b.students) - parseStudents(a.students);
        default:
          return 0;
      }
    });
  // --- End Filtering ---

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // --- University Card Component (Grid View) ---
  const UniversityCard = ({ university }) => (
    <motion.div
      variants={itemVariants}
      className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col" // Added flex flex-col
    >
      {/* --- Image Display using Map --- */}
      {universityImageMap[university.name] ? (
        <img
          src={universityImageMap[university.name]}
          alt={university.name}
          className="aspect-video w-full object-cover rounded-t-lg"
        />
      ) : (
        <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg flex items-center justify-center">
          <GraduationCap className="w-16 h-16 text-primary-600" />
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-secondary-900 flex-1 mr-2">{university.name}</h3>
          <div className="flex items-center flex-shrink-0">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium ml-1">{university.rating || 'N/A'}</span>
          </div>
        </div>
        <div className="flex items-center text-secondary-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{university.location || 'Location Unknown'}</span>
        </div>
        <div className="flex items-center text-secondary-600 text-sm mb-2">
          <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>Est. {university.established || 'N/A'}</span>
        </div>
        <div className="flex items-center text-secondary-600 text-sm mb-3">
          <Users className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{university.students || 'N/A'} Students</span>
        </div>
        <p className="text-secondary-600 text-sm mb-4 line-clamp-3 flex-grow">{university.description || 'No description available.'}</p>

        {/* Programs Snippet (Optional) */}
        {university.programs && university.programs.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-secondary-700 mb-1">Popular Programs:</p>
            <div className="flex flex-wrap gap-1">
              {university.programs.slice(0, 3).map((program, index) => {
                const programName = typeof program === 'string' ? program : (program.programName || 'Program');
                return (
                  <span key={index} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                    {programName.length > 20 ? `${programName.substring(0, 18)}...` : programName}
                  </span>
                );
              })}
              {university.programs.length > 3 && (
                <span className="text-xs text-secondary-500 self-center"> +{university.programs.length - 3} more </span>
              )}
            </div>
          </div>
        )}

        {/* Button */}
        <div className="mt-auto">
          <Link
            to={`/programs?university=${university.universityId || university.id}`}
            className="btn-primary w-full text-center flex items-center justify-center text-sm"
          >
            <span>View Programs</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
  // --- End Card Component ---

  // --- University List Item Component (List View) ---
  const UniversityListItem = ({ university }) => (
    <motion.div
      variants={itemVariants}
      className="card hover:shadow-md transition-shadow duration-300 p-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Image */}
        {universityImageMap[university.name] ? (
          <img
            src={universityImageMap[university.name]}
            alt={university.name}
            className="w-full sm:w-32 h-32 sm:h-24 object-cover rounded-lg flex-shrink-0"
          />
        ) : (
          <div className="w-full sm:w-32 h-32 sm:h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-12 h-12 text-primary-600" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-semibold text-secondary-900 truncate pr-2">{university.name}</h3>
            <div className="flex items-center flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{university.rating || 'N/A'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-xs text-secondary-600">
            <div className="flex items-center"> <MapPin className="w-3 h-3 mr-1" /> <span>{university.location || 'Unknown'}</span> </div>
            <div className="flex items-center"> <Calendar className="w-3 h-3 mr-1" /> <span>Est. {university.established || 'N/A'}</span> </div>
            <div className="flex items-center"> <Users className="w-3 h-3 mr-1" /> <span>{university.students || 'N/A'}</span> </div>
          </div>
          <p className="text-secondary-600 text-sm mb-3 line-clamp-2">{university.description || 'No description.'}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {university.programs && university.programs.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {university.programs.slice(0, 2).map((program, index) => {
                  const programName = typeof program === 'string' ? program : (program.programName || 'Program');
                  return (
                    <span key={index} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                       {programName.length > 25 ? `${programName.substring(0, 23)}...` : programName}
                    </span>
                  );
                })}
                {university.programs.length > 2 && ( <span className="text-xs text-secondary-500 self-center"> +{university.programs.length - 2} more </span> )}
              </div>
            )}
             <div className="mt-2 sm:mt-0 flex-shrink-0">
                <Link
                    to={`/programs?university=${university.universityId || university.id}`}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center"
                >
                    <span>View Programs</span> <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
  // --- End List Item Component ---

  // --- Main Return JSX ---
  return (
    <div className="min-h-screen bg-secondary-50 py-8 pt-24 md:pt-28"> {/* Adjusted padding top if navbar is fixed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-900 mb-3 sm:mb-4"> Partner Universities </h1>
          <p className="text-base sm:text-lg text-secondary-600 max-w-3xl mx-auto"> Discover prestigious universities offering world-class education and research opportunities. </p>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input type="text" placeholder="Search universities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 text-sm sm:text-base" />
            </div>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="input-field text-sm sm:text-base">
              <option value="">All Locations</option> {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm sm:text-base">
              <option value="name">Sort by Name</option> <option value="rating">Sort by Rating (High-Low)</option> <option value="students">Sort by Students (High-Low)</option>
            </select>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <button onClick={() => setViewMode('grid')} title="Grid View" className={`p-2 rounded-lg transition-colors duration-200 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-secondary-400 hover:text-secondary-600'}`}> <Grid className="w-5 h-5" /> </button>
              <button onClick={() => setViewMode('list')} title="List View" className={`p-2 rounded-lg transition-colors duration-200 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-secondary-400 hover:text-secondary-600'}`}> <List className="w-5 h-5" /> </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm text-secondary-600">
            <span> Showing {filteredUniversities.length} of {universities.length} universities </span>
            {(searchTerm || selectedLocation) && (
                <button onClick={() => { setSearchTerm(''); setSelectedLocation(''); }} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                    <X className="w-3 h-3" /> <span>Clear Filters</span>
                </button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 mx-auto mb-4 animate-spin" />
              <p className="text-base sm:text-lg text-secondary-600">Loading universities...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Universities Grid/List */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible"
              className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8' : 'space-y-4 sm:space-y-6'}>
              {filteredUniversities.map((uni) =>
                viewMode === 'grid'
                  ? <UniversityCard key={uni.universityId || uni.id} university={uni} />
                  : <UniversityListItem key={uni.universityId || uni.id} university={uni} />
              )}
            </motion.div>

            {/* No Results Message */}
            {!loading && filteredUniversities.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-2">No Universities Found</h3>
                <p className="text-secondary-600 mb-6 text-sm sm:text-base"> Try adjusting your search or filters, or check back later. </p>
                <button onClick={() => { setSearchTerm(''); setSelectedLocation(''); setSortBy('name'); }} className="btn-secondary text-sm"> Clear Filters </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
  // --- End Main Return ---
};

export default Universities; // <--- This line is crucial