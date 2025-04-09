import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon } from '@mui/icons-material';
import { useUser } from '@clerk/clerk-react';
import SearchHistory from '../components/SearchHistory';

const SearchHistoryPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  
  const handleSearchSelect = (searchData) => {
    const params = new URLSearchParams();
    
    if (searchData.query) params.set('q', searchData.query);
    if (searchData.mediaType) params.set('type', searchData.mediaType);
    if (searchData.licenseType) params.set('license', searchData.licenseType);
    if (searchData.creator) params.set('creator', searchData.creator);
    if (searchData.tags) params.set('tags', searchData.tags);
    if (searchData.source) params.set('source', searchData.source);
    
    navigate(`/search?${params.toString()}`);
  };

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