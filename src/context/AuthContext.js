import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    checkAuthStatus();

    // Set up callback for when authentication expires
    api.setOnAuthExpired(() => {
      handleAuthExpired();
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setIsAuthenticated(true);

        // Optionally fetch latest user data
        await fetchUserProfile(storedToken);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await api.get(API_ENDPOINTS.ME);
      if (response.success) {
        setUser(response.data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const handleAuthExpired = async () => {
    // Clear all authentication state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log('Authentication expired - user will be redirected to login');
  };

  const login = async (tokenValue, refreshTokenValue, userData) => {
    try {
      // Store both tokens using the api service
      await api.storeTokens(tokenValue, refreshTokenValue);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(tokenValue);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear tokens using api service which clears both token and refreshToken
      await api.clearTokens();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
