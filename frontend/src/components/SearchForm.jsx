// src/components/SearchForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Box, 
  Grid, 
  InputLabel,
  MenuItem,
  FormControl, 
  Select,
  Typography,
  IconButton,
  Collapse,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon 
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

/**
 * SearchForm component
 * Form for searching media with advanced options
 */
const SearchForm = ({ onSearch, defaultValues = {}, isLoading = false }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Initialize form with react-hook-form
  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      query: '',
      mediaType: 'images',
      licenseType: '',
      creator: '',
      tags: '',
      source: '',
      ...defaultValues
    }
  });
  
  // Update form values when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [defaultValues, setValue]);
  
  // Watch media type to update UI
  const mediaType = watch('mediaType');
  
  // Toggle advanced search options
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };
  
  // Reset the form
  const handleReset = () => {
    reset({
      query: '',
      mediaType: 'images',
      licenseType: '',
      creator: '',
      tags: '',
      source: ''
    });
    setShowAdvanced(false);
  };
  
  // Submit handler
  const onSubmit = (data) => {
    onSearch(data);
  };
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        backgroundColor: '#ffffff',
        transition: 'all 0.3s ease'
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Search query input */}
          <Grid item xs={12} md={6}>
            <Controller
              name="query"
              control={control}
              rules={{ required: 'Please enter a search term' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Search for open license media"
                  placeholder="e.g., nature, technology, music..."
                  fullWidth
                  variant="outlined"
                  error={!!error}
                  helperText={error ? error.message : ''}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    endAdornment: field.value ? (
                      <IconButton 
                        size="small" 
                        onClick={() => setValue('query', '')}
                        aria-label="clear search"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    ) : null
                  }}
                />
              )}
            />
          </Grid>
          
          {/* Media type selection */}
          <Grid item xs={12} md={3}>
            <Controller
              name="mediaType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="media-type-label">Media Type</InputLabel>
                  <Select
                    {...field}
                    labelId="media-type-label"
                    label="Media Type"
                  >
                    <MenuItem value="images">Images</MenuItem>
                    <MenuItem value="audio">Audio</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          {/* Search button */}
          <Grid item xs={12} md={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{ height: '56px' }}
              startIcon={<SearchIcon />}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
          
          {/* Advanced search toggle */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mb={1}>
              <Button
                type="button"
                color="primary"
                onClick={toggleAdvanced}
                startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </Button>
            </Box>
          </Grid>
          
          {/* Advanced search options */}
          <Grid item xs={12}>
            <Collapse in={showAdvanced}>
              <Box p={2} sx={{ backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Advanced Filter Options
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {/* License type filter */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="licenseType"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel id="license-type-label">License Type</InputLabel>
                          <Select
                            {...field}
                            labelId="license-type-label"
                            label="License Type"
                          >
                            <MenuItem value="">Any License</MenuItem>
                            <MenuItem value="cc0">CC0 (Public Domain)</MenuItem>
                            <MenuItem value="pdm">Public Domain Mark</MenuItem>
                            <MenuItem value="by">CC BY</MenuItem>
                            <MenuItem value="by-sa">CC BY-SA</MenuItem>
                            <MenuItem value="by-nc">CC BY-NC</MenuItem>
                            <MenuItem value="by-nd">CC BY-ND</MenuItem>
                            <MenuItem value="by-nc-sa">CC BY-NC-SA</MenuItem>
                            <MenuItem value="by-nc-nd">CC BY-NC-ND</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  {/* Creator filter */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="creator"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Creator"
                          placeholder="Filter by creator"
                          fullWidth
                          variant="outlined"
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  
                  {/* Source filter */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="source"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Source"
                          placeholder="e.g., flickr, wikimedia"
                          fullWidth
                          variant="outlined"
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  
                  {/* Tags filter */}
                  <Grid item xs={12}>
                    <Controller
                      name="tags"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Tags"
                          placeholder="Comma-separated tags (e.g., nature,water,sky)"
                          fullWidth
                          variant="outlined"
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  
                  {/* Reset button */}
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="button"
                        color="secondary"
                        onClick={handleReset}
                        startIcon={<ClearIcon />}
                      >
                        Reset All Filters
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Grid>
        </Grid>
      </form>
      
      {/* Media type information */}
      <Box mt={2} p={2} sx={{ backgroundColor: '#f1f8e9', borderRadius: 1, border: '1px solid #c5e1a5' }}>
        <Typography variant="body2" color="textSecondary">
          {mediaType === 'images' ? (
            'Search for openly licensed images from sources like Flickr, Wikimedia Commons, and more.'
          ) : (
            'Search for openly licensed audio files from sources like Freesound, Jamendo, and more.'
          )}
        </Typography>
      </Box>
    </Paper>
  );
};

export default SearchForm;