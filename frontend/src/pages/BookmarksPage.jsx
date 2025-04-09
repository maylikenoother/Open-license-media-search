import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { getBookmarks } from '../services/bookmarkService';
import MediaCard from '../components/MediaCard';
import { useUser } from '@clerk/clerk-react';

const BookmarksPage = () => {
  const { isSignedIn, user } = useUser();
  const [filter, setFilter] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const {
    data: bookmarks,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery('bookmarks', getBookmarks, {
    enabled: isSignedIn,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true
  });
  
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };
  
  const handleMediaTypeFilterChange = (event) => {
    setMediaTypeFilter(event.target.value);
  };
  
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  const clearFilter = () => {
    setFilter('');
  };
  
  const handleBookmarkChange = (mediaId, isBookmarked) => {
    if (!isBookmarked) {
      refetch();
    }
  };
  
  const filteredAndSortedBookmarks = useMemo(() => {
    if (!bookmarks) return [];

    let result = [...bookmarks];
    
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(item => 
        (item.media_title && item.media_title.toLowerCase().includes(lowerFilter)) ||
        (item.media_creator && item.media_creator.toLowerCase().includes(lowerFilter))
      );
    }
    
    if (mediaTypeFilter !== 'all') {
      result = result.filter(item => item.media_type === mediaTypeFilter);
    }
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.media_title || '').localeCompare(b.media_title || ''));
    } else if (sortBy === 'creator') {
      result.sort((a, b) => (a.media_creator || '').localeCompare(b.media_creator || ''));
    }
    
    return result;
  }, [bookmarks, filter, mediaTypeFilter, sortBy]);
  
  const bookmarkCounts = useMemo(() => {
    if (!bookmarks) return { total: 0, images: 0, audio: 0 };
    
    return {
      total: bookmarks.length,
      images: bookmarks.filter(item => item.media_type === 'images').length,
      audio: bookmarks.filter(item => item.media_type === 'audio').length
    };
  }, [bookmarks]);
  
  if (!isSignedIn) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please sign in to view your bookmarks.
        </Alert>
      </Container>
    );
  }
  
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </Container>
    );
  }
  
  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading bookmarks: {error?.message || 'Unknown error'}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <BookmarkIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Your Bookmarks
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Filter bookmarks"
              placeholder="Search by title or creator"
              fullWidth
              variant="outlined"
              value={filter}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filter && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearFilter} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="media-type-filter-label">Media Type</InputLabel>
              <Select
                labelId="media-type-filter-label"
                label="Media Type"
                value={mediaTypeFilter}
                onChange={handleMediaTypeFilterChange}
              >
                <MenuItem value="all">All Types ({bookmarkCounts.total})</MenuItem>
                <MenuItem value="images">
                  <Box display="flex" alignItems="center">
                    <ImageIcon sx={{ mr: 1 }} />
                    Images ({bookmarkCounts.images})
                  </Box>
                </MenuItem>
                <MenuItem value="audio">
                  <Box display="flex" alignItems="center">
                    <MusicNoteIcon sx={{ mr: 1 }} />
                    Audio ({bookmarkCounts.audio})
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                label="Sort By"
                value={sortBy}
                onChange={handleSortChange}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="title">Title (A-Z)</MenuItem>
                <MenuItem value="creator">Creator (A-Z)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-start" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredAndSortedBookmarks.length} of {bookmarkCounts.total} bookmarks
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {(!bookmarks || bookmarks.length === 0) && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BookmarkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Bookmarks Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bookmarks you save will appear here. Start searching and bookmark media items you like!
          </Typography>
        </Paper>
      )}
      
      {bookmarks && bookmarks.length > 0 && filteredAndSortedBookmarks.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Matching Bookmarks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No bookmarks match your current filters. Try adjusting your search criteria.
          </Typography>
        </Paper>
      )}
      
      {filteredAndSortedBookmarks.length > 0 && (
        <Grid container spacing={3}>
          {filteredAndSortedBookmarks.map((bookmark) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={bookmark.id}>
              <MediaCard
                item={{
                  id: bookmark.media_id,
                  title: bookmark.media_title || 'Untitled',
                  creator: bookmark.media_creator || 'Unknown',
                  license: bookmark.media_license || 'Unknown',
                  url: bookmark.media_url,
                  provider: bookmark.media_type,
                  thumbnail: bookmark.media_url
                }}
                isBookmarked={true}
                onBookmarkChange={handleBookmarkChange}
                showDetailedView={true}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default BookmarksPage;