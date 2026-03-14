import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getLiveMatches = async () => {
  const response = await api.get('/live-matches');
  return response.data;
};

export const getMatchDetails = async (matchId) => {
  const response = await api.get(`/live-matches/${matchId}`);
  return response.data;
};

export const getMatchesHistory = async () => {
  const response = await api.get('/matches-history');
  return response.data;
};
