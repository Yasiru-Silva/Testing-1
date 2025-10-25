import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Universities from './pages/Universities';
import Programs from './pages/Programs';
import Application from './pages/Application';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentNotifications from './pages/StudentNotifications';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplicantReview from './pages/AdminApplicantReview';
import AdminStudentManagement from './pages/AdminStudentManagement';
import AdminNotifications from './pages/AdminNotifications';
import PaymentUpload from './pages/PaymentUpload';
import AdminPaymentManagement from './pages/AdminPaymentManagement';
import AdminMessageManagement from './pages/AdminMessageManagement';
import AdminUniversityManagement from './pages/AdminUniversityManagement';
import AdminProgramManagement from './pages/AdminProgramManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <>
                <Navbar />
                <Home />
                <Footer />
              </>
            } />
            <Route path="/universities" element={
              <>
                <Navbar />
                <Universities />
                <Footer />
              </>
            } />
            <Route path="/programs" element={
              <>
                <Navbar />
                <Programs />
                <Footer />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Navbar />
                <Contact />
                <Footer />
              </>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route path="/apply" element={
              <>
                <Navbar />
                <ProtectedRoute allowedUserTypes={['STUDENT']}>
                  <Application />
                </ProtectedRoute>
                <Footer />
              </>
            } />
            <Route path="/dashboard" element={
              <>
                <Navbar />
                <ProtectedRoute allowedUserTypes={['STUDENT', 'ADMIN']}>
                  <Dashboard />
                </ProtectedRoute>
                <Footer />
              </>
            } />
            <Route path="/student/dashboard" element={
              <>
                <Navbar />
                <ProtectedRoute allowedUserTypes={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
                <Footer />
              </>
            } />
            <Route path="/student/notifications" element={
              <>
                <Navbar />
                <ProtectedRoute allowedUserTypes={['STUDENT']}>
                  <StudentNotifications />
                </ProtectedRoute>
                <Footer />
              </>
            } />
            <Route path="/payment/:applicationId" element={
              <>
                <Navbar />
                <ProtectedRoute allowedUserTypes={['STUDENT']}>
                  <PaymentUpload />
                </ProtectedRoute>
                <Footer />
              </>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <>
                <AdminNavbar />
                <ProtectedRoute allowedUserTypes={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              </>
            } />
            <Route path="/admin/dashboard" element={
              <>
                <AdminNavbar />
                <ProtectedRoute allowedUserTypes={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              </>
            } />
            <Route path="/admin/applicants" element={
              <>
                <AdminNavbar />
                <ProtectedRoute allowedUserTypes={['ADMIN']}>
                  <AdminApplicantReview />
                </ProtectedRoute>
              </>
            } />
            <Route path="/admin/students" element={
              <>
                <AdminNavbar />
                <ProtectedRoute allowedUserTypes={['ADMIN']}>
                  <AdminStudentManagement />
                </ProtectedRoute>
              </>
            } />
            <Route path="/admin/notifications" element={
              <>
                <AdminNavbar />
                <ProtectedRoute allowedUserTypes={['ADMIN']}>
                  <AdminNotifications />
                </ProtectedRoute>
              </>
            } />
            <Route path="/admin/payments" element={
              <>
                <AdminNavbar />
                <ProtectedRoute allowedUserTypes={['ADMIN']}>
                  <AdminPaymentManagement />
                </ProtectedRoute>
              </>
            } />
            <Route path="/admin/messages" element={
              <>
                <AdminNavbar />
                <ProtectedRoute allowedUserTypes={['ADMIN']}>
                  <AdminMessageManagement />
                </ProtectedRoute>
              </>
            } />
            <Route path="/admin/universities" element={
              <>
                <AdminNavbar />
                <ProtectedRoute allowedUserTypes={['ADMIN']}>
                  <AdminUniversityManagement />
                </ProtectedRoute>
              </>
            } />
            <Route path="/admin/programs" element={
              <>
                <AdminNavbar />
                <ProtectedRoute allowedUserTypes={['ADMIN']}>
                  <AdminProgramManagement />
                </ProtectedRoute>
              </>
            } />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4ade80',
                  secondary: '#black',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

