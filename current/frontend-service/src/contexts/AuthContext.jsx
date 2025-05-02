import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch current user details
      api.get('/auth/me')
        .then((resp) => setUser(resp.data))
        .catch((err) => {
          console.error('Failed to fetch user info', err);
          setUser(null);
        });
    } else {
      // Clear auth header and user info
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded data
    const payload = new URLSearchParams();
    payload.append('username', email);
    payload.append('password', password);
    const response = await api.post('/auth/login', payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    setToken(response.data.access_token);
    localStorage.setItem('token', response.data.access_token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 