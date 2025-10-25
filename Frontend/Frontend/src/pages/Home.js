// src/pages/Home.js

import React from 'react';
import { Link } from 'react-router-dom'; // Keep Link for other buttons/links
import { motion } from 'framer-motion';
import {
  ArrowRight,
  GraduationCap,
  Globe,
  Users,
  Award,
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
// Import the data AS universityData, which now includes website for all
import { universities as universityData } from '../data/universities';

// --- IMAGE IMPORTS (Keep if using direct import method) ---
import chuvashAgrarian from '../assets/chuvash agrarian.jpg';
import chuvashPedagogical from '../assets/chuvash pedagogical.jpg';
import kazanInnovative from '../assets/kazan innovative.jpg';
import lobachevsky from '../assets/lobachevsky.jpg';
import samaraNational from '../assets/samara national.jpg';
import yaroslavlTech from '../assets/yaroslavl tech.jpg';
// --- END OF IMAGE IMPORTS ---

const Home = () => {

  // --- IMAGE MAP (Keep if using direct import method) ---
  const universityImageMap = {
    "Chuvash State Pedagogical University": chuvashPedagogical,
    "Samara National Research University": samaraNational,
    "Yaroslavl State Technical University (YSTU)": yaroslavlTech,
    "Chuvash State Agrarian University": chuvashAgrarian,
    "Lobachevsky State University of Nizhny Novgorod (UNN)": lobachevsky,
    "Kazan Innovative University": kazanInnovative,
  };
  // --- END OF IMAGE MAP ---

  // --- COMBINE DATA WITH IMAGES (Keep if using direct import method) ---
  const universitiesWithImages = universityData.map(uni => ({
    ...uni,
    image: universityImageMap[uni.name] || null
  }));
  // --- END OF COMBINING DATA ---

  const stats = [
    { icon: GraduationCap, value: '6', label: 'Partner Universities' },
    { icon: Globe, value: '100+', label: 'Programs Available' },
    { icon: Users, value: '5000+', label: 'Students Placed' },
    { icon: Award, value: '95%', label: 'Success Rate' },
  ];

  const features = [
    { icon: CheckCircle, title: 'Expert Guidance', description: 'Professional counselors guide you through every step of your study abroad journey.'},
    { icon: Globe, title: 'Global Opportunities', description: 'Access to top universities and programs across Russia and beyond.' },
    { icon: Users, title: 'Community Support', description: 'Join a network of successful students and alumni worldwide.' },
    { icon: Award, title: 'Proven Success', description: 'High success rates with our comprehensive application support.'}
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold mb-6"> Every Success Story <br /> <span className="text-yellow-300">Begins with a Dream</span> </motion.h1>
            <motion.p variants={itemVariants} className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto"> Discover world-class education opportunities and turn your academic dreams into reality with SIT International's comprehensive study abroad services. </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/apply" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"> <span>Start Your Journey</span> <ArrowRight className="w-5 h-5" /> </Link>
              <Link to="/universities" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"> <GraduationCap className="w-5 h-5" /> <span>Explore Universities</span> </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => { const Icon = stat.icon; return ( <motion.div key={index} variants={itemVariants} className="text-center"> <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"> <Icon className="w-8 h-8 text-primary-600" /> </div> <h3 className="text-3xl font-bold text-secondary-900 mb-2">{stat.value}</h3> <p className="text-secondary-600">{stat.label}</p> </motion.div> ); })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4"> Why Choose SIT International? </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-secondary-600 max-w-3xl mx-auto"> We provide comprehensive support throughout your study abroad journey, from university selection to post-arrival assistance. </motion.p>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => { const Icon = feature.icon; return ( <motion.div key={index} variants={itemVariants} className="card text-center hover:shadow-lg transition-shadow duration-300"> <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"> <Icon className="w-8 h-8 text-primary-600" /> </div> <h3 className="text-xl font-semibold text-secondary-900 mb-4">{feature.title}</h3> <p className="text-secondary-600">{feature.description}</p> </motion.div> ); })}
          </motion.div>
        </div>
      </section>

      {/* Universities Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4"> Our Partner Universities </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-secondary-600 max-w-3xl mx-auto"> Discover prestigious universities offering world-class education and research opportunities. </motion.p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {universitiesWithImages.slice(0, 6).map((university, index) => (
              <motion.div key={university.id} variants={itemVariants} className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                {university.image ? (
                  <img src={university.image} alt={university.name} className="aspect-video w-full object-cover rounded-t-lg mb-4"/>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg mb-4 flex items-center justify-center">
                     <GraduationCap className="w-16 h-16 text-primary-600" />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">{university.name}</h3>
                    <div className="flex items-center text-secondary-600 text-sm mb-2"> <MapPin className="w-4 h-4 mr-1 flex-shrink-0" /> <span>{university.location}</span> </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center"> <Star className="w-4 h-4 text-yellow-400 fill-current" /> <span className="text-secondary-600 ml-1">{university.rating}</span> </div>
                        <div className="flex items-center"> <Users className="w-4 h-4 mr-1"/> <span>{university.students}</span> </div>
                    </div>
                    <p className="text-secondary-600 text-sm mb-4 line-clamp-2 flex-grow">{university.description}</p>

                    {/* --- Link to Official Website --- */}
                    <div className="mt-auto">
                        {university.website ? ( // Check if the website property exists
                        <a
                            href={university.website} // Use the website property from data
                            target="_blank"          // Open in new tab
                            rel="noopener noreferrer" // Security measure
                            className="btn-outline w-full text-center text-sm"
                        >
                            Learn More
                        </a>
                        ) : (
                        // Optional: Fallback if website is missing in data
                        <span className="btn-outline w-full text-center text-sm text-gray-400 cursor-not-allowed">
                            Website N/A
                        </span>
                        )}
                    </div>
                    {/* --- End Link --- */}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-12">
            <Link to="/universities" className="btn-primary inline-flex items-center space-x-2"> <span>View All Universities</span> <ArrowRight className="w-5 h-5" /> </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-6"> Ready to Start Your Journey? </motion.h2>
            <motion.p variants={itemVariants} className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto"> Join thousands of successful students who have achieved their dreams through our comprehensive study abroad programs. </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/apply" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"> <span>Apply Now</span> <ArrowRight className="w-5 h-5" /> </Link>
              <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"> <span>Get Consultation</span> </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;