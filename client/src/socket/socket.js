import io from 'socket.io-client';

// Connects to backend. Checks environment variable first, defaults to localhost:5000
const URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

export const socket = io(URL);