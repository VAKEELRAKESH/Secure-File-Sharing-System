import axios from 'axios';

// Create a customized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // This is the most important line for your security!
  // It tells Axios to send and receive HttpOnly cookies automatically.
  withCredentials: true, 
});

export default api;