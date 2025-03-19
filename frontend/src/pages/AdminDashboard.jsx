import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Container, Typography } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import API_BASE_URL from "../config";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.isAdmin) {
      axios.get(`${API_BASE_URL}/users`)
        .then((res) => setUsers(res.data))
        .catch(() => setError("Failed to fetch users."));
    }
  }, [user]);

  if (!user?.isAdmin) {
    return <Typography variant="h6">Access Denied: Admin Only</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4">Admin Dashboard</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {users.map((user) => (
        <Typography key={user.id}>{user.email}</Typography>
      ))}
    </Container>
  );
};

export default AdminDashboard;
