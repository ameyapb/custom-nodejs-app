import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!api.token);

  const login = async (email, password) => {
    await api.login(email, password);
    setIsAuthenticated(true);
  };

  const register = async (email, password) => {
    await api.register(email, password);
    setIsAuthenticated(true);
  };

  const logout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, register, logout };
}
