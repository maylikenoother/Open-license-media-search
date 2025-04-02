// src/components/SearchFilters.jsx
import React, { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Chip,
  TextField,
  Button,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon,
  Search as SearchIcon
} from '@mui/icons-material';

/**
 * SearchFilters component
 * Sidebar filters for refining search results
 */
const SearchFilters = ({ 
  activeFilters = {}, 
  onFilterChange, 
  mediaType = 'images',
  onReset
}) => {
  const [expanded, setExpanded] = useState(['license', 'source']);
  const [tagInput, setTagInput] = useState('');
  
  // Handle accordion expansion
  const handleAccordionToggle = (panel) => (event, isExpanded) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, panel] 
        : prev.filter(item => item !== panel)
    );
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...activeFilters,
      [filterType]: value
    });
  };
  
  // Handle license type change
  const handleLicenseChange = (event) => {
    handleFilterChange('licenseType', event.target.value);
  };
  
  // Handle tag input
  const handleTagInputChange = (event) => {
    setTagInput(event.target.value);
  };
  
  // Add a tag
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = activeFilters.tags || '';
    const tagsArray = currentTags ? currentTags.split(',') : [];
    
    if (!tagsArray.includes(tagInput.trim())) {
      const newTags = [...tagsArray, tagInput.trim()].join(',');
      handleFilterChange('tags', newTags);
    }
    
    setTagInput('');
  };
  
  // Remove a tag
  const removeTag = (tagToRemove) => {
    const currentTags = activeFilters.tags || '';
    const tagsArray = currentTags.split(',');
    const newTags = tagsArray.filter(tag => tag !== tagToRemove).join(',');
    
    handleFilterChange('tags', newTags || '');
  };
  
  // Handle enter key in tag input
  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    }
  };
  
  // Get active tags as array
  const getActiveTags = () => {
    const tags = activeFilters.tags || '';
    return tags ? tags.split(',').filter(tag => tag.trim()) : [];
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    onReset();
  };
  
  // Check if any filters are active
  const hasActiveFilters = Object.values(activeFilters).some(value => value && value !== '');
  
  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant="h6" component="h2">
          <FilterAltIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Filters
        </Typography>
        
        {hasActiveFilters && (
          <Button 
            size="small" 
            onClick={handleResetFilters}
            startIcon={<ClearIcon />}
          >
            Reset All
          </Button>
        )}
      </Box>
      
      {/* Media Type */}
      <Accordion
        expanded={expanded.includes('mediaType')}
        onChange={handleAccordionToggle('mediaType')}
        disableGutters
        elevation={0}
        sx={{ 
          border: '1px solid rgba(0, 0, 0, 0.12)',
          '&:before': { display: 'none' },
          mb: 2
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Media Type</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl component="fieldset">
            <RadioGroup
              value={activeFilters.mediaType || 'images'}
              onChange={(e) => handleFilterChange('mediaType', e.target.value)}
            >
              <FormControlLabel value="images" control={<Radio />} label="Images" />
              <FormControlLabel value="audio" control={<Radio />} label="Audio" />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      
      {/* License Type */}
      <Accordion
        expanded={expanded.includes('license')}
        onChange={handleAccordionToggle('license')}
        disableGutters
        elevation={0}
        sx={{ 
          border: '1px solid rgba(0, 0, 0, 0.12)',
          '&:before': { display: 'none' },
          mb: 2
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>License Type</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl component="fieldset">
            <RadioGroup
              value={activeFilters.licenseType || ''}
              onChange={handleLicenseChange}
            >
              <FormControlLabel value="" control={<Radio />} label="Any License" />
              <FormControlLabel value="cc0" control={<Radio />} label="CC0 (Public Domain)" />
              <FormControlLabel value="pdm" control={<Radio />} label="Public Domain Mark" />
              <FormControlLabel value="by" control={<Radio />} label="CC BY" />
              <FormControlLabel value="by-sa" control={<Radio />} label="CC BY-SA" />
              <FormControlLabel value="by-nc" control={<Radio />} label="CC BY-NC" />
              <FormControlLabel value="by-nd" control={<Radio />} label="CC BY-ND" />
              <FormControlLabel value="by-nc-sa" control={<Radio />} label="CC BY-NC-SA" />
              <FormControlLabel value="by-nc-nd" control={<Radio />} label="CC BY-NC-ND" />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      
      {/* Source */}
      <Accordion
        expanded={expanded.includes('source')}
        onChange={handleAccordionToggle('source')}
        disableGutters
        elevation={0}
        sx={{ 
          border: '1px solid rgba(0, 0, 0, 0.12)',
          '&:before': { display: 'none' },
          mb: 2
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Source</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            label="Filter by source"
            placeholder={mediaType === 'images' ? "e.g., flickr, wikimedia" : "e.g., freesound, jamendo"}
            fullWidth
            variant="outlined"
            size="small"
            value={activeFilters.source || ''}
            onChange={(e) => handleFilterChange('source', e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Popular sources:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {mediaType === 'images' ? (
                <>
                  <Chip 
                    label="Flickr" 
                    size="small" 
                    onClick={() => handleFilterChange('source', 'flickr')}
                    clickable
                  />
                  <Chip 
                    label="Wikimedia" 
                    size="small" 
                    onClick={() => handleFilterChange('source', 'wikimedia')}
                    clickable
                  />
                  <Chip 
                    label="Rawpixel" 
                    size="small" 
                    onClick={() => handleFilterChange('source', 'rawpixel')}
                    clickable
                  />
                </>
              ) : (
                <>
                  <Chip 
                    label="Freesound" 
                    size="small" 
                    onClick={() => handleFilterChange('source', 'freesound')}
                    clickable
                  />
                  <Chip 
                    label="Jamendo" 
                    size="small" 
                    onClick={() => handleFilterChange('source', 'jamendo')}
                    clickable
                  />
                  <Chip 
                    label="CC Mixter" 
                    size="small" 
                    onClick={() => handleFilterChange('source', 'ccmixter')}
                    clickable
                  />
                </>
              )}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Creator */}
      <Accordion
        expanded={expanded.includes('creator')}
        onChange={handleAccordionToggle('creator')}
        disableGutters
        elevation={0}
        sx={{ 
          border: '1px solid rgba(0, 0, 0, 0.12)',
          '&:before': { display: 'none' },
          mb: 2
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Creator</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            label="Filter by creator"
            placeholder="Creator name"
            fullWidth
            variant="outlined"
            size="small"
            value={activeFilters.creator || ''}
            onChange={(e) => handleFilterChange('creator', e.target.value)}
          />
        </AccordionDetails>
      </Accordion>
      
      {/* Tags */}
      <Accordion
        expanded={expanded.includes('tags')}
        onChange={handleAccordionToggle('tags')}
        disableGutters
        elevation={0}
        sx={{ 
          border: '1px solid rgba(0, 0, 0, 0.12)',
          '&:before': { display: 'none' },
          mb: 2
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Tags</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            label="Add tag"
            placeholder="e.g., nature, water, music"
            fullWidth
            variant="outlined"
            size="small"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagKeyDown}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {getActiveTags().length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {getActiveTags().map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default SearchFilters;