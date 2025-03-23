import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  Link,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });

      localStorage.setItem("auth_token", res.data.access_token);
      navigate("/search");
    } catch (error) {
      setError(error.response?.data?.detail || "Invalid credentials.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Login
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </form>

        <Divider sx={{ my: 2, width: "100%" }}>OR</Divider>

        <Button variant="contained" color="secondary" fullWidth onClick={handleGoogleLogin}>
          Sign in with Google
        </Button>

        <Typography sx={{ mt: 2 }}>
          Are you a new user?{" "}
          <Link href="/register" underline="hover">
            Register Now
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
