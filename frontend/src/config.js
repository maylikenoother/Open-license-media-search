// src/config.js
const isDevelopment = import.meta.env.DEV;
const isDocker = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.includes('backend');

let apiBaseUrl;
if (isDocker) {
  // Docker environment
  apiBaseUrl = import.meta.env.VITE_API_URL;
} else if (isDevelopment) {
  // Local development
  apiBaseUrl = '/api';
} else {
  // Production
  apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
}

const config = {
  apiUrl: apiBaseUrl,
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  }
};

export default config;