import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("auth_token");

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/search"
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
          }}
        >
          OLMSearch
        </Typography>
        {isAuthenticated && (
          <Box>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
