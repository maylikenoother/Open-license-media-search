import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Grid, Container, Typography } from "@mui/material";
import MediaCard from "../components/MediaCard";
import API_BASE_URL from "../config";

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [media, setMedia] = useState([]);
  const [error, setError] = useState(null);

  const searchMedia = async () => {
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/search?query=${query}&media_type=images`);
      setMedia(res.data.results);
    } catch (error) {
      setError("Failed to fetch media. Please try again.");
    }
  };

  return (
    <Container>
      <Typography variant="h4">Search Media</Typography>
      <TextField label="Search" fullWidth margin="normal" onChange={(e) => setQuery(e.target.value)} />
      <Button variant="contained" onClick={searchMedia} sx={{ mt: 2 }}>Search</Button>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {media.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <MediaCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;
