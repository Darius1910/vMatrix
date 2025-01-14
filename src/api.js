// Import axios only once
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Backend URL
  withCredentials: true, // Povolenie cookies pri každej požiadavke
});

// Prihlásenie
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// Kontrola autentifikácie
export const checkAuth = async () => {
  const response = await api.get('/session/me');  // Get user session (including username)
  return response.data;  // Return the session data (which includes username)
};


// Získanie session
export const getSession = async () => {
  const response = await api.get('/session');
  return response.data;
};

export const updateSession = async (darkMode) => {
  const response = await api.post('/session', { darkMode });
  return response.data;
};

// Odhlásenie
export const logout = async () => {
  const response = await api.get('/auth/logout'); // Match the backend route
  return response.data;
};