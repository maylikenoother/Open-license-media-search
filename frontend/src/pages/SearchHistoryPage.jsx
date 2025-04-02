// src/pages/SearchHistoryPage.jsx
import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon } from '@mui/icons-material';
import { useUser } from '@clerk/clerk-react';
import SearchHistory from '../components/SearchHistory';

/**
 * SearchHistoryPage component
 * Page displaying user's search history
 */
const SearchHistoryPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  
  // Handle search selection
  const handleSearchSelect = (searchData) => {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (searchData.query) params.set('q', searchData.query);
    if (searchData.mediaType) params.set('type', searchData.mediaType);
    if (searchData.licenseType) params.set('license', searchData.licenseType);
    if (searchData.creator) params.set('creator', searchData.creator);
    if (searchData.tags) params.set('tags', searchData.tags);
    if (searchData.source) params.set('source', searchData.source);
    
    // Navigate to search page with params
    navigate(`/search?${params.toString()}`);
  };
  
  // Show authentication message if not signed in
  if (!isSignedIn) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please sign in to view your search history.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <HistoryIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Search History
        </Typography>
      </Box>
      
      <SearchHistory onSearchSelect={handleSearchSelect} />
    </Container>
  );
};

export default SearchHistoryPage;