import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { contactAPI } from '../services/api';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    subject: '',
    messageContent: '',
    messageType: 'GENERAL_INQUIRY'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.messageContent.trim()) newErrors.messageContent = 'Message is required';

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
      await contactAPI.send(formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error?.response?.data?.message || 'Failed to send message. Please try again.'); // Show backend error if available
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: ['No:135/3/20 EL Senanayake St, Kandy, Sri Lanka'],
      color: 'text-blue-600'
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['0702635042'],
      color: 'text-green-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['sit.intsl@gmail.com'],
      color: 'text-purple-600'
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 1:00 PM'],
      color: 'text-orange-600'
    }
  ];

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

  // Success Message Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-secondary-50 py-16 flex items-center justify-center"> {/* Centering */}
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white p-10 rounded-xl shadow-lg border border-secondary-200" // Added card styling
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 ring-4 ring-green-200"> {/* Added ring */}
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Message Sent Successfully!
            </h1>
            <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto"> 
              Thank you for contacting us. We have received your message and will get back to you within 24 business hours.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ 
                  name: '',
                  email: '',
                  phoneNumber: '',
                  subject: '',
                  messageContent: '',
                  messageType: 'GENERAL_INQUIRY'
                });
                setErrors({});
              }}
              className="btn-primary"
            >
              Send Another Message
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Contact Page Content
  return (
    <div className="min-h-screen bg-secondary-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-primary-200" // Added ring
          >
            <MessageCircle className="w-8 h-8 text-primary-600" />
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg text-secondary-600 max-w-3xl mx-auto" // Reduced text size
          >
            Have questions about our programs or need assistance with your application?
            We're here to help you every step of the way.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h2 className="text-2xl font-bold text-secondary-900 mb-8">Contact Information</h2>
            <div className="space-y-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start space-x-4"
                  >
                    <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${info.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-1">{info.title}</h3> {/* Reduced mb */}
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-secondary-600 text-sm mb-0.5 break-words"> {/* Added break-words */}
                          {detail}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>


          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-secondary-700 mb-1.5"> 
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`input-field ${errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
                      placeholder="Enter your full name"
                      required 
                    />
                    {errors.name && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`input-field ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      placeholder="Enter your email address"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`input-field ${errors.phoneNumber ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      placeholder="Enter your phone number"
                      required
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                      Message Type
                    </label>
                    <select
                      name="messageType"
                      value={formData.messageType}
                      onChange={handleInputChange}
                      className="input-field" 
                    >
                      <option value="GENERAL_INQUIRY">General Inquiry</option>
                      <option value="PROGRAM_INFO">Program Information</option>
                      <option value="APPLICATION_HELP">Application Help</option>
                      <option value="SCHOLARSHIP_INFO">Scholarship Information</option>
                      <option value="PAYMENT_ISSUE">Payment Issue</option>
                      <option value="TECHNICAL_SUPPORT">Technical Support</option>
                      <option value="COMPLAINT">Complaint</option>
                      <option value="FEEDBACK">Feedback</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`input-field ${errors.subject ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    placeholder="Enter message subject"
                    required
                  />
                  {errors.subject && (
                    <p className="text-red-600 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.subject}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    name="messageContent"
                    value={formData.messageContent}
                    onChange={handleInputChange}
                    rows={5} // Reduced rows slightly
                    className={`input-field ${errors.messageContent ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    placeholder="Tell us how we can help you..."
                    required
                  />
                  {errors.messageContent && (
                    <p className="text-red-600 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.messageContent}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-secondary-500 text-center mt-3"> 
                    We typically respond within 24 hours during business days.
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>

       
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-20"
        >
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto"> {/* Reduced size */}
              Find quick answers to common questions about our study abroad programs.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                question: "What are the admission requirements?",
                answer: "Admission requirements vary by university and program. Generally, you'll need academic transcripts, English proficiency test scores (if applicable), passport copy, and a motivation letter."
              },
              {
                question: "How long does the application process take?",
                answer: "The application process typically takes 4-8 weeks, depending on the university's response time, document verification, and visa processing timelines."
              },
              {
                question: "Do you provide visa assistance?",
                answer: "Yes, we provide comprehensive visa assistance including document checklist, application guidance, and interview preparation tips based on embassy requirements."
              },
              {
                question: "What support do you offer after admission?",
                answer: "We offer pre-departure orientation, assistance with airport pickup arrangements, guidance on finding accommodation, and ongoing support during your studies."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6"
              >
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{faq.question}</h3> {/* Reduced mb */}
                <p className="text-secondary-600 text-sm">{faq.answer}</p> {/* Reduced size */}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
