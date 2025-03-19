import React from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";

const MediaCard = ({ item }) => {
  return (
    <Card>
      <CardMedia component="img" height="140" image={item.url} alt={item.title} />
      <CardContent>
        <Typography variant="h6">{item.title}</Typography>
      </CardContent>
    </Card>
  );
};

export default MediaCard;
