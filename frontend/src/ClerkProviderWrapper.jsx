// src/ClerkProviderWrapper.jsx
import React, { useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import config from './config';

// Token Manager component to handle token updates
const TokenManager = () => {
  const { getToken, isSignedIn } = useAuth();
  
  useEffect(() => {
    // Function to update token in localStorage
    const updateToken = async () => {
      console.log("TokenManager running, isSignedIn:", isSignedIn);
      
      if (isSignedIn) {
        try {
          const token = await getToken();
          console.log("Got token from Clerk:", token ? "Token received" : "No token");
          
          if (token) {
            localStorage.setItem('clerk-token', token);
            console.log("Authentication token saved to localStorage");
            
            // Also set as a cookie for backup
            document.cookie = `clerk-token=${token}; path=/; max-age=3600; SameSite=Lax`;
            console.log("Authentication token saved as cookie");
          }
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      } else {
        localStorage.removeItem('clerk-token');
        console.log("Auth token removed - user not signed in");
        
        // Clear cookie as well
        document.cookie = "clerk-token=; path=/; max-age=0";
      }
      
      // Debug: Check if token exists in localStorage
      const storedToken = localStorage.getItem('clerk-token');
      console.log("Token in localStorage:", storedToken ? "Present" : "Not found");
    };
    
    // Update token immediately
    updateToken();
    
    // Set up listener for auth state changes
    const intervalId = setInterval(updateToken, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [getToken, isSignedIn]);
  
  return null;
};

/**
 * ClerkProviderWithNavigate component
 * This wraps the ClerkProvider with the routing context
 */
function ClerkProviderWithNavigate({ children }) {
  const navigate = useNavigate();
  
  return (
    <ClerkProvider
      publishableKey={config.clerk.publishableKey}
      navigate={(to) => navigate(to)}
    >
      <TokenManager />
      {children}
    </ClerkProvider>
  );
}

/**
 * AuthenticationWrapper component
 * This component handles the authenticated vs unauthenticated views
 */
function AuthenticationWrapper({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

/**
 * ClerkProviderWrapper component
 * This provides Clerk authentication to the entire application
 */
export function ClerkProviderWrapper({ children, requireAuth = false }) {
  return (
    <BrowserRouter>
      <ClerkProviderWithNavigate>
        {requireAuth ? (
          <AuthenticationWrapper>{children}</AuthenticationWrapper>
        ) : (
          children
        )}
      </ClerkProviderWithNavigate>
    </BrowserRouter>
  );
}