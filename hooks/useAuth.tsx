import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { MOCK_USERS_KEY, SESSION_USER_KEY } from '../constants';
import { User } from '../types';

// --- Helper Functions ---
const initializeMockUsers = (): void => {
  if (localStorage.getItem(MOCK_USERS_KEY)) return;
  
  const defaultUsers: User[] = [
    {
      id: 'user-001-admin',
      name: 'Gestor',
      email: 'gestor', // For backward compatibility with original login
      password: 'cambinda@2025#',
      status: 'active',
    },
  ];
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultUsers));
};

const getUsers = (): User[] => {
  const users = localStorage.getItem(MOCK_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]): void => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};
// --- End Helper Functions ---


interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password_param: string) => Promise<boolean>;
  signup: (name: string, email: string, password_param: string) => Promise<{success: boolean, message: string}>;
  logout: () => void;
  updateCurrentUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize mock data on load
initializeMockUsers();

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for a logged-in user in sessionStorage
    const loggedInUserEmail = sessionStorage.getItem(SESSION_USER_KEY);
    if (loggedInUserEmail) {
      const allUsers = getUsers();
      const currentUser = allUsers.find(u => u.email === loggedInUserEmail);
      if (currentUser) {
        setUser(currentUser);
      }
    }
    setIsLoading(false);
  }, []);
  
  const login = async (email: string, password_param: string): Promise<boolean> => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const allUsers = getUsers();
        const foundUser = allUsers.find(u => u.email === email && u.password === password_param);
        if (foundUser) {
          setUser(foundUser);
          sessionStorage.setItem(SESSION_USER_KEY, foundUser.email);
          resolve(true);
        } else {
          resolve(false);
        }
        setIsLoading(false);
      }, 500);
    });
  };

  const signup = async (name: string, email: string, password_param: string): Promise<{success: boolean, message: string}> => {
     setIsLoading(true);
     return new Promise((resolve) => {
      setTimeout(() => {
        const allUsers = getUsers();
        if (allUsers.some(u => u.email === email)) {
          setIsLoading(false);
          resolve({ success: false, message: 'Este email já está em uso.' });
          return;
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          password: password_param,
          status: 'pending_payment',
        };

        allUsers.push(newUser);
        saveUsers(allUsers);
        setIsLoading(false);
        resolve({ success: true, message: 'Conta criada com sucesso!' });
      }, 500);
     });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
  };
  
  const updateCurrentUser = (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    const allUsers = getUsers();
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      saveUsers(allUsers);
    }
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, signup, logout, isLoading, updateCurrentUser }}>
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