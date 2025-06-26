
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../constants';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username_param: string, password_param: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Check auth status on load

  useEffect(() => {
    // Simulate checking stored session
    const storedAuth = sessionStorage.getItem('gapp_is_authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username_param: string, password_param: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call for login
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username_param === ADMIN_USERNAME && password_param === ADMIN_PASSWORD) {
          setIsAuthenticated(true);
          sessionStorage.setItem('gapp_is_authenticated', 'true');
          resolve(true);
        } else {
          resolve(false);
        }
        setIsLoading(false);
      }, 500);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('gapp_is_authenticated');
    // Potentially redirect to login page or home page
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
