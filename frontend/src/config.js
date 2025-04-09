const isDevelopment = import.meta.env.DEV;
const isDocker = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.includes('backend');
const isRender = import.meta.env.VITE_RENDER || false;

let apiBaseUrl;
if (isRender) {
  apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
} else if (isDocker) {
  const hostname = window.location.hostname;
  apiBaseUrl = `http://${hostname}:8000/api`;
} else if (isDevelopment) {
  apiBaseUrl = '/api';
} else {
  apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
}

const config = {
  apiUrl: `${import.meta.env.VITE_API_URL || '/api'}`,
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  }
};

export default config;