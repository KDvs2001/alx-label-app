import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy handles this
  headers: {
    'Content-Type': 'application/json'
  }
});

// simulationApi export removed (Legacy Simulation Code)

export default api;
