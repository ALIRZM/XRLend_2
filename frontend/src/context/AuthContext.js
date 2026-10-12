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

 

  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch {

    }
    localStorage.removeItem('xrlend-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
