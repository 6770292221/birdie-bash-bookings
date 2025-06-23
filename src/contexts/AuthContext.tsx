
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin credentials
const MOCK_ADMIN = {
  email: 'admin@badminton.com',
  password: 'admin123',
  user: {
    id: '1',
    email: 'admin@badminton.com',
    role: 'admin' as const,
    name: 'Admin User'
  }
};

// Mock regular user credentials
const MOCK_USER = {
  email: 'user@badminton.com',
  password: 'user123',
  user: {
    id: '2',
    email: 'user@badminton.com',
    role: 'user' as const,
    name: 'Regular User'
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      setUser(MOCK_ADMIN.user);
      return true;
    }
    
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      setUser(MOCK_USER.user);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
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
