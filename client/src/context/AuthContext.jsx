import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('recco_token');
    if (token) {
      const storedUser = localStorage.getItem('recco_user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('recco_token', res.data.token);
    localStorage.setItem('recco_refresh_token', res.data.refreshToken);
    localStorage.setItem('recco_user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('recco_token');
    localStorage.removeItem('recco_refresh_token');
    localStorage.removeItem('recco_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};