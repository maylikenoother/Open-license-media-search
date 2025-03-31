import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import MediaCard from "../components/MediaCard";
import API_BASE_URL from "../config";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState("images");
  const [media, setMedia] = useState([]);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem("auth_token"));

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      if (!localStorage.getItem("auth_token")) {
        localStorage.setItem("auth_token", token);
        setAuthToken(token);
      }
      window.history.replaceState({}, "", "/search");
    }
  }, []);

  const searchMedia = async () => {
    setError(null);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/search?query=${query}&media_type=${mediaType}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setMedia(res.data.results);
    } catch (error) {
      setError("Failed to fetch media. Please try again.");
    }
  };

  return (
    <Container sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Search for Media
      </Typography>

      <Box
        display="flex"
        gap={2}
        flexDirection="column"
        alignItems="center"
        width="100%"
        maxWidth={500}
      >
        <TextField
          label="Search Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="media-type-label">Media Type</InputLabel>
          <Select
            labelId="media-type-label"
            value={mediaType}
            label="Media Type"
            onChange={(e) => setMediaType(e.target.value)}
          >
            <MenuItem value="images">Images</MenuItem>
            <MenuItem value="audio">Audio</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={searchMedia} fullWidth>
          Search
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2} sx={{ mt: 4 }}>
        {media.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <MediaCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SearchPage;
