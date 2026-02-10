'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, AuthResponse } from '@/lib/api';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'client' | 'provider';
  profession?: string;
  description?: string;
  profile_image?: string;
}

interface RegisterResult {
  message: string;
  clientId?: { id: string };
  clientid?: { id: string };
  providerId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: 'client' | 'provider') => Promise<void>;
  register: (data: any, role: 'client' | 'provider') => Promise<RegisterResult>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and user on mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'client' | 'provider') => {
    try {
      let response: AuthResponse;
      
      if (role === 'client') {
        response = await authAPI.clientLogin({ email, password, role: 'client' });
      } else {
        response = await authAPI.providerLogin({ email, password, role: 'provider' });
      }

      const userData = role === 'client' ? response.client : response.provider;
      
      if (userData && response.token) {
        const user: User = {
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          role,
          profession: role === 'provider' ? (userData as any).profession : undefined,
          description: role === 'provider' ? (userData as any).description : undefined,
          profile_image: (userData as any).profile_image,
        };

        setUser(user);
        setToken(response.token);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (data: any, role: 'client' | 'provider'): Promise<RegisterResult> => {
    try {
      // Add role to the data
      const dataWithRole = { ...data, role };
      
      let result: RegisterResult;
      
      if (role === 'client') {
        result = await authAPI.clientRegister(dataWithRole);
      } else {
        const providerResult = await authAPI.providerRegister(dataWithRole);
        result = { message: providerResult.message, providerId: providerResult.providerId };
      }
      
      // Auto-login after registration
      await login(data.email, data.password, role);
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

