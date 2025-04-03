// src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Divider,
  Fab,
  Alert,
  Button
} from '@mui/material';
import {
  Tune as TuneIcon,
  Close as CloseIcon,
  FilterAlt as FilterAltIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useUser, SignInButton } from '@clerk/clerk-react';
import SearchForm from '../components/SearchForm';
import MediaGrid from '../components/MediaGrid';
import SearchFilters from '../components/SearchFilters';
import SearchHistory from '../components/SearchHistory';
import useMediaSearch from '../hooks/useMediaSearch';

/**
 * SearchPage component
 * Main page for searching media
 */
const SearchPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  
  // Get search functionality from custom hook
  const { 
    searchParams,
    setSearchParams,
    searchPerformed,
    popularMedia,
    searchResults,
    isLoading,
    isError,
    error,
    performSearch,
    resetSearch,
    changePage,
    changeMediaType,
    authError,
    isAuthenticated
  } = useMediaSearch();
  
  // Parse query parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const query = params.get('q');
    const mediaType = params.get('type') || 'images';
    const page = parseInt(params.get('page') || '1', 10);
    const licenseType = params.get('license') || '';
    const creator = params.get('creator') || '';
    const tags = params.get('tags') || '';
    const source = params.get('source') || '';
    
    // If there are query parameters, perform search
    if (query) {
      const newParams = {
        query,
        mediaType,
        page,
        licenseType,
        creator,
        tags,
        source
      };
      
      setSearchParams(newParams);
      performSearch(newParams);
    }
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update URL with search parameters
  useEffect(() => {
    if (searchPerformed) {
      const params = new URLSearchParams();
      
      if (searchParams.query) params.set('q', searchParams.query);
      if (searchParams.mediaType) params.set('type', searchParams.mediaType);
      if (searchParams.page > 1) params.set('page', searchParams.page.toString());
      if (searchParams.licenseType) params.set('license', searchParams.licenseType);
      if (searchParams.creator) params.set('creator', searchParams.creator);
      if (searchParams.tags) params.set('tags', searchParams.tags);
      if (searchParams.source) params.set('source', searchParams.source);
      
      navigate(`?${params.toString()}`, { replace: true });
    }
  }, [searchParams, searchPerformed, navigate]);
  
  // Handle search submission
  const handleSearch = (data) => {
    performSearch(data);
  };
  
  // Handle filter changes
  const handleFilterChange = (filters) => {
    performSearch({ ...filters, page: 1 });
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    changePage(page);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle search from history
  const handleSearchFromHistory = (searchData) => {
    performSearch(searchData);
    setActiveTab(0); // Switch to results tab
  };
  
  // Toggle mobile filters drawer
  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };
  
  // Calculate result stats
  const getResultStats = () => {
    if (!searchResults) return {};
    
    return {
      totalResults: searchResults.count || 0,
      totalPages: Math.ceil((searchResults.count || 0) / searchParams.pageSize),
      currentPage: searchParams.page || 1
    };
  };
  
  const { totalResults, totalPages, currentPage } = getResultStats();
  
  // Media to display (search results or popular media)
  const mediaToDisplay = searchPerformed ? 
    (searchResults?.results || []) : 
    popularMedia;
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Authentication Alert */}
      {authError && searchPerformed && (
        <Alert 
          severity="info" 
          action={
            <SignInButton mode="modal">
              <Button 
                color="primary" 
                size="small" 
                variant="contained"
                startIcon={<LoginIcon />}
              >
                Sign In
              </Button>
            </SignInButton>
          }
          sx={{ mb: 3 }}
        >
          Please sign in to save your search history and bookmark media items.
        </Alert>
      )}
      
      {/* Search form */}
      <SearchForm 
        onSearch={handleSearch} 
        defaultValues={searchParams}
        isLoading={isLoading}
      />
      
      {/* Main content */}
      <Grid container spacing={3}>
        {/* Sidebar filters (desktop) */}
        {!isMobile && (
          <Grid item xs={12} md={3} lg={2}>
            <SearchFilters
              activeFilters={searchParams}
              onFilterChange={handleFilterChange}
              mediaType={searchParams.mediaType}
              onReset={resetSearch}
            />
          </Grid>
        )}
        
        {/* Main content area */}
        <Grid item xs={12} md={9} lg={10}>
          {/* Tabs for results/history */}
          {isSignedIn && (
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isSmall ? "fullWidth" : "standard"}
              >
                <Tab label="Search Results" />
                <Tab label="Search History" />
              </Tabs>
            </Paper>
          )}
          
          {/* Search Results Tab */}
          {(!isSignedIn || activeTab === 0) && (
            <Box>
              {searchPerformed && (
                <Typography variant="h5" component="h1" gutterBottom>
                  {isLoading ? (
                    'Searching...'
                  ) : searchResults?.results?.length > 0 ? (
                    `Results for "${searchParams.query}"`
                  ) : (
                    `No results found for "${searchParams.query}"`
                  )}
                </Typography>
              )}
              
              <MediaGrid
                media={mediaToDisplay}
                isLoading={isLoading}
                error={error}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
                totalResults={totalResults}
                query={searchParams.query}
                mediaType={searchParams.mediaType}
              />
            </Box>
          )}
          
          {/* Search History Tab */}
          {isSignedIn && activeTab === 1 && (
            <SearchHistory onSearchSelect={handleSearchFromHistory} />
          )}
        </Grid>
      </Grid>
      
      {/* Mobile filters button */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="filter"
          onClick={toggleMobileFilters}
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
        >
          <FilterAltIcon />
        </Fab>
      )}
      
      {/* Mobile filters drawer */}
      <Drawer
        anchor="right"
        open={mobileFiltersOpen}
        onClose={toggleMobileFilters}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}
          >
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={toggleMobileFilters}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <SearchFilters
            activeFilters={searchParams}
            onFilterChange={(filters) => {
              handleFilterChange(filters);
              if (isMobile) setMobileFiltersOpen(false);
            }}
            mediaType={searchParams.mediaType}
            onReset={resetSearch}
          />
        </Box>
      </Drawer>
    </Container>
  );
};

export default SearchPage;