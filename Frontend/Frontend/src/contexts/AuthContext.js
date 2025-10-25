import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      const userData = JSON.parse(savedUser);
      setToken(savedToken);
      setUser({
        ...userData,
        // For backward compatibility, also set studentId/adminId based on userType
        ...(userData.userType === 'STUDENT' ? { studentId: userData.userId } : {}),
        ...(userData.userType === 'ADMIN' ? { adminId: userData.userId } : {})
      });
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token: newToken, userType, role, email, userId, firstName, lastName } = response.data;
      
      // Store token and user info
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify({
        email,
        userType,
        role,
        userId,
        firstName,
        lastName
      }));
      
      setToken(newToken);
      setUser({
        email,
        userType,
        role,
        userId,
        firstName,
        lastName,
        // For backward compatibility, also set studentId/adminId based on userType
        ...(userType === 'STUDENT' ? { studentId: userId } : {}),
        ...(userType === 'ADMIN' ? { adminId: userId } : {})
      });
      
      const displayName = firstName || 'User';
      toast.success(`Welcome ${displayName}!`);
      return { success: true, userType, role, email, userId, firstName, lastName };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const registerStudent = async (studentData) => {
    try {
      await authAPI.registerStudent(studentData);
      toast.success('Student registration successful! Please login.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const registerAdmin = async (adminData) => {
    try {
      await authAPI.registerAdmin(adminData);
      toast.success('Admin registration successful! Please login.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAdmin = () => {
    return user?.userType === 'ADMIN';
  };

  const isStudent = () => {
    return user?.userType === 'STUDENT';
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const value = {
    user,
    token,
    loading,
    login,
    registerStudent,
    registerAdmin,
    logout,
    isAdmin,
    isStudent,
    hasRole,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

