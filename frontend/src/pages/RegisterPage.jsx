import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Divider,
  Box,
  Link,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/users/register`, {
        username,
        email,
        password,
      });

      console.log("Registration successful:", res.data);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error.response ? error.response.data : error);
      setError(error.response?.data?.detail || "Registration failed. Please try again.");
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

        <form onSubmit={handleRegister} style={{ width: "100%" }}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
            Register
          </Button>
        </form>

        <Divider sx={{ my: 2, width: "100%" }}>OR</Divider>

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={handleGoogleRegister}
        >
          Continue with Google
        </Button>

        <Typography sx={{ mt: 2 }}>
          Already registered?{" "}
          <Link href="/login" underline="hover">
            Login
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;
