// src/config.js
const config = {
    apiUrl: import.meta.env.VITE_API_URL || '/api',
    clerk: {
      publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
    }
  };
  
  export default config;