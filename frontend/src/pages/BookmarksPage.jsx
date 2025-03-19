import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography } from "@mui/material";
import MediaGrid from "../components/MediaGrid";
import API_BASE_URL from "../config";

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/users/bookmarks`)
      .then((res) => setBookmarks(res.data))
      .catch(() => setError("Failed to fetch bookmarks."));
  }, []);

  return (
    <Container>
      <Typography variant="h4">Your Bookmarks</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <MediaGrid media={bookmarks} />
    </Container>
  );
};

export default BookmarksPage;
