import React from "react";
import { Grid } from "@mui/material";
import MediaCard from "./MediaCard";

const MediaGrid = ({ media }) => {
  return (
    <Grid container spacing={2}>
      {media.map((item) => (
        <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
          <MediaCard item={item} />
        </Grid>
      ))}
    </Grid>
  );
};

export default MediaGrid;
