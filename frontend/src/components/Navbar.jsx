import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link as RouterLink } from "react-router-dom";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

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
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="View your bookmarks" arrow>
              <IconButton component={RouterLink} to="/bookmarks" color="inherit">
                <BookmarkBorderIcon />
              </IconButton>
            </Tooltip>
            <UserButton afterSignOutUrl="/" />
          </Box>
        </SignedIn>
      </Box>
    </Toolbar>
  </AppBar>
);

export default Navbar;
