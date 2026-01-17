import axios from 'axios';

const API_URL = '/api';

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { username, password });
  return response.data;
};

export const signup = async (username, password) => {
  const response = await axios.post(`${API_URL}/auth/signup`, { username, password });
  return response.data;
};
