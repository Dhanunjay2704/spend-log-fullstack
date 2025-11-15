import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/axiosInstance';

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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const getCurrentUser = async () => {
    try {
      const response = await authAPI.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Get current user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.post('/auth/login', { email, password });
      const { data, token: newToken } = response.data.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(data);
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.post('/auth/register', userData);
      const { data, token: newToken } = response.data.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(data);
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete authAPI.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.put('/auth/profile', profileData);
      setUser(response.data.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};