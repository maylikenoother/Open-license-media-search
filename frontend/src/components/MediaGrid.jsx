import React, { useEffect, useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import axios from "axios";
import API_BASE_URL from "../config";

const MediaCard = ({ item }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const token = localStorage.getItem("auth_token");

  const media_id = item.id;
  const media_url = item.url || item.url_o || item.thumbnail || item.foreign_landing_url;
  const media_type = item.provider || "images";

  // Check if item is already bookmarked (for demo, we just skip that for now)
  useEffect(() => {
    // Optional: preload bookmarks and check here
    // Skipping for simplicity unless you'd like to track all bookmarks in a parent state
  }, []);

  const toggleBookmark = async () => {
    if (!token) return;

    try {
      if (!isBookmarked) {
        await axios.post(
          `${API_BASE_URL}/users/bookmarks`,
          { media_id, media_url, media_type },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsBookmarked(true);
      } else {
        await axios.delete(
          `${API_BASE_URL}/users/bookmarks/${media_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsBookmarked(false);
      }
    } catch (error) {
      alert("Bookmark action failed.");
    }
  };

  return (
    <Card>
      <CardMedia component="img" height="140" image={media_url} alt={item.title} />
      <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" noWrap>
          {item.title}
        </Typography>
        <Tooltip title={isBookmarked ? "Remove Bookmark" : "Add to Bookmarks"} arrow>
          <IconButton onClick={toggleBookmark}>
            {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Tooltip>
      </CardContent>
    </Card>
  );
};

export default MediaCard;
