import { AxiosError } from 'axios';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean; 
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.accessToken);
      setUser(data.user);
      toast.success('Добро пожаловать! 🎉');
      return true;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string | string[] }>;
      const message = axiosError.response?.data?.message;
      const formattedMessage = Array.isArray(message) ? message.join(', ') : message || axiosError.message || 'Ошибка входа';
      toast.error(formattedMessage);
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register', { email, password, name });
      const data = res.data;
      
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.accessToken);
      setUser(data.user);
      toast.success('Регистрация успешна! 🚀');
      return true;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string | string[] }>;
      const message = axiosError.response?.data?.message;
      const formattedMessage = Array.isArray(message) ? message.join(', ') : message || axiosError.message || 'Ошибка регистрации';
      toast.error(formattedMessage);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.info('Вы вышли из системы 👋');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token,
      loading, 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};