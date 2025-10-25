import React from 'react';
import { Link } from 'react-router-dom';
import {

  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import logo from '../assets/logo.png'; 

const Footer = () => {


  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              
              <img
                src={logo}
                alt="SIT International Logo"
                className="w-10 h-10 object-contain rounded-lg"
              />
              
              <div>
                <h3 className="text-xl font-bold">SIT International</h3>
                <p className="text-sm text-secondary-300">Study Abroad Portal</p>
              </div>
            </div>
            <p className="text-secondary-300 text-sm leading-relaxed">
              Your gateway to world-class education. We connect students with top universities
              and help them achieve their academic dreams abroad.
            </p>
             
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/universities" className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Universities
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Services</h4>
            <ul className="space-y-2">
              <li className="text-secondary-300 text-sm">University Selection</li>
              <li className="text-secondary-300 text-sm">Application Assistance</li>
              <li className="text-secondary-300 text-sm">Visa Support</li>
              <li className="text-secondary-300 text-sm">Documentation Help</li>
              <li className="text-secondary-300 text-sm">Pre-departure Guidance</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3"> 
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" /> 
                <span className="text-secondary-300 text-sm">
                  No:135/3/20 EL Senanayake St, Kandy, Sri Lanka
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" /> 
                <span className="text-secondary-300 text-sm">0702635042</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" /> 
                <span className="text-secondary-300 text-sm break-all">sit.intsl@gmail.com</span> 
              </div>
            </div>
          </div>
        </div>

       

      </div>
    </footer>
  );
};

export default Footer;

