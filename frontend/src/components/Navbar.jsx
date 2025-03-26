// src/components/Navbar.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link as RouterLink } from "react-router-dom";

const Navbar = () => (
  <AppBar position="static">
    <Toolbar sx={{ justifyContent: "space-between" }}>
      <Typography
        variant="h6"
        component={RouterLink}
        to="/search"
        sx={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}
      >
        OLMSearch
      </Typography>

      <Box>
        <SignedOut>
          <SignInButton mode="modal">
            <Button color="inherit">Sign In</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </Box>
    </Toolbar>
  </AppBar>
);

export default Navbar;
