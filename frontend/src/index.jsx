// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';
import { ClerkProviderWrapper } from './ClerkProviderWrapper';
import './styles/global.css';

// Add these imports
import axios from 'axios';
import { getAuthHeaders } from './services/authService';

// Add request interceptor to always include auth headers
axios.interceptors.request.use(config => {
  // Don't add headers for requests to external domains
  if (config.url.startsWith('/api') || config.url.includes('localhost')) {
    const authHeaders = getAuthHeaders();
    config.headers = { ...config.headers, ...authHeaders };
    console.log('Added auth headers to request:', config.url);
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// For debugging - log responses
axios.interceptors.response.use(response => {
  console.log(`Response from ${response.config.url}:`, response.status);
  return response;
}, error => {
  console.error(`Error response from ${error.config?.url}:`, error.response?.status, error.message);
  return Promise.reject(error);
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProviderWrapper>
        <App />
      </ClerkProviderWrapper>
    </QueryClientProvider>
  </React.StrictMode>
);