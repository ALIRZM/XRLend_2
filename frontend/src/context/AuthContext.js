import React, { createContext, useState, useContext } from 'react';
import axiosInstance from '../axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('xrlend-user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem('xrlend-user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (fields) => {
    const next = { ...user, ...fields };
    localStorage.setItem('xrlend-user', JSON.stringify(next));
    setUser(next);
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch {
    }
    localStorage.removeItem('xrlend-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);