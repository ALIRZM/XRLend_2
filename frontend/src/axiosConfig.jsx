import axios from 'axios';

const axiosInstance = axios.create({

  // same address as the page also works through the load balancer.
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '',
  headers: { 'Content-Type': 'application/json' },
});

// WO this the server returns 401.
axiosInstance.interceptors.request.use((config) => {
  const stored = localStorage.getItem('xrlend-user');
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;