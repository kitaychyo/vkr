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

export const getMatchesHistory = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.radiantTeam) params.append('radiant_team', filters.radiantTeam);
  if (filters.direTeam) params.append('dire_team', filters.direTeam);
  if (filters.status) params.append('status', filters.status);
  if (filters.minDuration) params.append('min_duration', filters.minDuration);
  if (filters.maxDuration) params.append('max_duration', filters.maxDuration);
  
  const response = await api.get(`/matches-history?${params.toString()}`);
  return response.data;
};
