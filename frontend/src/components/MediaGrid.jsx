// src/components/MediaGrid.jsx
import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  Alert, 
  CircularProgress, 
  Pagination, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useQuery } from 'react-query';
import MediaCard from './MediaCard';
import { getBookmarks } from '../services/bookmarkService';

/**
 * MediaGrid component
 * Displays a grid of media items with pagination
 */
const MediaGrid = ({ 
  media, 
  isLoading = false, 
  error = null, 
  onPageChange = null,
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  query = '',
  mediaType = 'images'
}) => {
  const [bookmarkedMedia, setBookmarkedMedia] = useState({});
  const [sortOrder, setSortOrder] = useState('relevance');
  const [displayItems, setDisplayItems] = useState([]);
  
  // Fetch bookmarks to highlight already bookmarked items
  const { data: bookmarks } = useQuery(
    'bookmarks',
    getBookmarks,
    { 
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        // Create map of bookmarked media IDs
        const bookmarkMap = {};
        data.forEach(bookmark => {
          bookmarkMap[bookmark.media_id] = true;
        });
        setBookmarkedMedia(bookmarkMap);
      }
    }
  );
  
  // Update displayed items when media or sort order changes
  useEffect(() => {
    if (!media || !Array.isArray(media)) {
      setDisplayItems([]);
      return;
    }
    
    // Clone the array to avoid mutating props
    let items = [...media];
    
    // Apply sorting
    if (sortOrder === 'title_asc') {
      items.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortOrder === 'title_desc') {
      items.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else if (sortOrder === 'creator_asc') {
      items.sort((a, b) => (a.creator || '').localeCompare(b.creator || ''));
    } else if (sortOrder === 'creator_desc') {
      items.sort((a, b) => (b.creator || '').localeCompare(a.creator || ''));
    }
    // 'relevance' is the default sorting from the API
    
    setDisplayItems(items);
  }, [media, sortOrder]);
  
  // Handle bookmark change
  const handleBookmarkChange = (mediaId, isBookmarked) => {
    setBookmarkedMedia(prev => ({
      ...prev,
      [mediaId]: isBookmarked
    }));
  };
  
  // Handle sort change
  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="300px"
        flexDirection="column"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Searching for {mediaType}...
        </Typography>
      </Box>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Error: {error.message || 'Failed to load media'}
      </Alert>
    );
  }
  
  // Show empty state if no results
  if (!displayItems || displayItems.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="300px"
        flexDirection="column"
        sx={{ px: 2, py: 4, backgroundColor: '#f5f5f5', borderRadius: 2 }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {query ? 'No results found' : 'Search for open license media'}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          {query 
            ? `Try different search terms or filters`
            : `Enter a search term to find ${mediaType} with open licenses`
          }
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Results info and sorting */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        mb={3}
        gap={2}
      >
        {/* Results count */}
        <Box>
          <Typography variant="body1" color="text.secondary">
            {totalResults ? (
              <>
                Showing page {currentPage} of{' '}
                <Chip 
                  label={`${totalResults.toLocaleString()} results`} 
                  color="primary" 
                  size="small"
                  variant="outlined"
                />
              </>
            ) : (
              `Showing ${displayItems.length} items`
            )}
          </Typography>
        </Box>
        
        {/* Sorting options */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="sort-select-label">Sort By</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortOrder}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="title_asc">Title (A-Z)</MenuItem>
            <MenuItem value="title_desc">Title (Z-A)</MenuItem>
            <MenuItem value="creator_asc">Creator (A-Z)</MenuItem>
            <MenuItem value="creator_desc">Creator (Z-A)</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Media grid */}
      <Grid container spacing={3}>
        {displayItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <MediaCard 
              item={item} 
              isBookmarked={bookmarkedMedia[item.id] || false}
              onBookmarkChange={handleBookmarkChange}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <Box 
          display="flex" 
          justifyContent="center" 
          mt={4}
          mb={2}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => onPageChange(page)}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default MediaGrid;