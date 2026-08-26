import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types/api';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  switchRolePreset: (role: UserRole) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const switchRolePreset = async (role: UserRole) => {
    setIsLoading(true);
    try {
      let email = 'guest@example.com';
      let password = 'password123';

      if (role === 'ADMIN') {
        email = 'admin@guesthouse.com';
        password = 'adminpassword123';
      } else if (role === 'RECEPTIONIST') {
        email = 'receptionist@guesthouse.com';
        password = 'receptionpassword123';
      } else if (role === 'STUDENT') {
        email = 'student@university.edu';
        password = 'password123';
      }

      // Try login first or register if not existing
      try {
        const res = await api.post('/auth/login', { email, password });
        login(res.data.data.token, res.data.data.user);
      } catch (err) {
        const res = await api.post('/auth/register', {
          name: `Demo ${role}`,
          email,
          password,
          role,
          studentId: role === 'STUDENT' ? 'STU/2026/0889' : undefined,
        });
        login(res.data.data.token, res.data.data.user);
      }
    } catch (err) {
      console.error('Role preset switch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRolePreset, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
