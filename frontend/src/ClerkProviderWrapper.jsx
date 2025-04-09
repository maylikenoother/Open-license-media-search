import React, { useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import config from './config';

const TokenManager = () => {
  const { getToken, isSignedIn } = useAuth();
  
  useEffect(() => {
    const updateToken = async () => {
      console.log("TokenManager running, isSignedIn:", isSignedIn);
      
      if (isSignedIn) {
        try {
          const token = await getToken();
          console.log("Got token from Clerk:", token ? "Token received" : "No token");
          
          if (token) {
            localStorage.setItem('clerk-token', token);
            console.log("Authentication token saved to localStorage");
            
            document.cookie = `clerk-token=${token}; path=/; max-age=3600; SameSite=Lax`;
            console.log("Authentication token saved as cookie");
          }
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      } else {
        localStorage.removeItem('clerk-token');
        console.log("Auth token removed - user not signed in");
        
        document.cookie = "clerk-token=; path=/; max-age=0";
      }
      
      const storedToken = localStorage.getItem('clerk-token');
      console.log("Token in localStorage:", storedToken ? "Present" : "Not found");
    };
    
    updateToken();
    const intervalId = setInterval(updateToken, 30000);
    
    return () => clearInterval(intervalId);
  }, [getToken, isSignedIn]);
  
  return null;
};

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