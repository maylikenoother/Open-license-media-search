import React, { useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Automatically set API base URL based on environment
const API_BASE_URL = import.meta.env.MODE === "development"
  ? "/api"
  : "http://open_license_media_api:8000";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null); // Reset errors before making a new request

    try {
      const res = await axios.post(`${API_BASE_URL}/users/register`, {
        username,
        email,
        password
      });

      console.log("Registration successful:", res.data);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error.response ? error.response.data : error);
      setError(error.response?.data?.detail || "Registration failed. Please try again.");
    }
  };

  return (
    <Container>
      <Typography variant="h4">Register</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleRegister}>
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
        <Button type="submit" variant="contained" color="primary">
          Register
        </Button>
      </form>
    </Container>
  );
};

export default RegisterPage;
