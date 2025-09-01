
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SkillLevel = 'P' | 'S' | 'BG' | 'N';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  skillLevel?: SkillLevel;
  profilePicture?: string;
  joinedDate?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: { user: UserProfile } | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

// Mock users data
const mockUsers = [
  {
    id: 'bc235d14-40db-4bd7-82d6-edeb0a19c48e',
    email: 'admin@badminton.com',
    password: 'admin123',
    role: 'admin' as const,
    name: 'ผู้ดูแลระบบ',
    skillLevel: 'P' as SkillLevel,
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
    joinedDate: '2023-01-15'
  },
  {
    id: 'b2a84508-41dd-4644-9881-8d5e8587e067',
    email: 'user@badminton.com',
    password: 'user123',
    role: 'user' as const,
    name: 'สมชาย รักแบด',
    skillLevel: 'BG' as SkillLevel,
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
    joinedDate: '2023-06-20'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<{ user: UserProfile } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setSession({ user: userData });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      // Find user in mock data
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!mockUser) {
        return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
      }
      
      const userData: UserProfile = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
        skillLevel: mockUser.skillLevel,
        profilePicture: mockUser.profilePicture,
        joinedDate: mockUser.joinedDate
      };
      
      setUser(userData);
      setSession({ user: userData });
      localStorage.setItem('mockUser', JSON.stringify(userData));
      
      return {};
    } catch (error) {
      return { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    try {
      // For mock implementation, just return success
      return { error: 'การสมัครสมาชิกไม่พร้อมใช้งานในโหมดทดสอบ' };
    } catch (error) {
      return { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' };
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('mockUser');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      register, 
      logout, 
      isAdmin, 
      loading 
    }}>
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
