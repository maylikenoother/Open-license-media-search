import React from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn
} from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const ClerkProviderWrapper = ({ children }) => (
  <ClerkProvider
    publishableKey={publishableKey}
    navigate={(to) => window.history.pushState(null, "", to)}
  >
    <BrowserRouter>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/search" />
      </SignedOut>
    </BrowserRouter>
  </ClerkProvider>
);
