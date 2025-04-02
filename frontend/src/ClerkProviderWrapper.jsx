// src/ClerkProviderWrapper.jsx
import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import config from './config';

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
export function ClerkProviderWrapper({ children, requireAuth = true }) {
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