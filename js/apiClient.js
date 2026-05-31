import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
});

export async function loadLocalDb() {
  const response = await axios.get('./db.json');
  return response.data;
}
