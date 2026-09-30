import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync and verify user profile on initial mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const profile = await authAPI.getCurrentUser();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Failed to verify token on startup', err);
          // Token might be expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    setToken(data.token);
    localStorage.setItem('token', data.token);

    const userInfo = {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));

    // Try fetching full profile with phone/address
    try {
      const fullProfile = await authAPI.getCurrentUser();
      setUser(fullProfile);
      localStorage.setItem('user', JSON.stringify(fullProfile));
    } catch {
      // Ignore if /me fails
    }

    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    setToken(data.token);
    localStorage.setItem('token', data.token);

    const userInfo = {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));

    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
