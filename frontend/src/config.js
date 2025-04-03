// src/config.js
const isDevelopment = import.meta.env.DEV;
const isDocker = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.includes('backend');
const isRender = import.meta.env.VITE_RENDER || false;

let apiBaseUrl;
if (isRender) {
  // When deployed on Render, use the backend URL from environment variable
  apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
} else if (isDocker) {
  // For browser requests in Docker, use the window location's hostname
  const hostname = window.location.hostname;
  apiBaseUrl = `http://${hostname}:8000/api`;
} else if (isDevelopment) {
  // Local development
  apiBaseUrl = '/api';
} else {
  // Production fallback
  apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
}

const config = {
  apiUrl: `${import.meta.env.VITE_API_URL || '/api'}`,
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  }
};

export default config;