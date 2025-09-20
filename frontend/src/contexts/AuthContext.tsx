'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, RegisterData } from '@/types';
import { api, handleApiError } from '@/utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;

        setUser(userData);
        setToken(userToken);

        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success('Login successful!');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);

      if (response.data.success) {
        const { user: newUser, token: userToken } = response.data.data;

        setUser(newUser);
        setToken(userToken);

        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        toast.success('Registration successful!');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}