import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        setUser(user);
        setIsAuthenticated(true);
        console.log('✅ User logged in:', user.displayName);
      } else {
        console.log('❌ User not logged in');
      }
    } catch (error) {
      console.error('Check auth state error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    try {

      const token = `token_${Date.now()}_${Math.random()}`;
      

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      

      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('✅ Login successful:', userData.displayName);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {

      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      

      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      checkAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
};
