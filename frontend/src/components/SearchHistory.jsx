import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Divider,
  Button,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  Image as ImageIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getSearchHistory, deleteSearchHistory, clearSearchHistory } from '../services/searchService';
import { formatDistanceToNow } from 'date-fns';

const SearchHistory = ({ onSearchSelect }) => {
  const queryClient = useQueryClient();
  
  const { 
    data: history, 
    isLoading, 
    isError, 
    error 
  } = useQuery('searchHistory', getSearchHistory, {
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false
  });
  
  const deleteMutation = useMutation(
    (historyId) => deleteSearchHistory(historyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('searchHistory');
      }
    }
  );
  
  const clearMutation = useMutation(
    () => clearSearchHistory(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('searchHistory');
      }
    }
  );
  
  const handleSearchSelect = (item) => {
    if (onSearchSelect) {
      const searchParams = item.search_params || {};
      onSearchSelect({
        query: item.search_query,
        mediaType: searchParams.media_type || 'images',
        licenseType: searchParams.license_type || '',
        creator: searchParams.creator || '',
        tags: searchParams.tags || '',
        source: searchParams.source || ''
      });
    }
  };
  
  const handleDelete = (historyId, event) => {
    event.stopPropagation();
    deleteMutation.mutate(historyId);
  };
  
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      clearMutation.mutate();
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        p={3}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading search history: {error?.message || 'Unknown error'}
      </Alert>
    );
  }
  
  if (!history || history.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <HistoryIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Search History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your recent searches will appear here
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          p: 2
        }}
      >
        <Typography variant="h6" component="h2">
          <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Recent Searches
        </Typography>
        
        <Tooltip title="Clear all history">
          <Button
            size="small"
            startIcon={<DeleteSweepIcon />}
            onClick={handleClearAll}
            disabled={clearMutation.isLoading}
            color="error"
          >
            Clear All
          </Button>
        </Tooltip>
      </Box>
      
      <Divider />
      
      <List sx={{ p: 0 }}>
        {history.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem 
              button 
              onClick={() => handleSearchSelect(item)}
              sx={{ 
                py: 2,
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <ListItemIcon>
                {(item.search_params?.media_type === 'audio') ? (
                  <MusicNoteIcon color="primary" />
                ) : (
                  <ImageIcon color="primary" />
                )}
              </ListItemIcon>
              
              <ListItemText
                primary={item.search_query}
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {item.result_count !== null && (
                      <Chip
                        label={`${item.result_count} results`}
                        size="small"
                        sx={{ mr: 1, mb: 0.5 }}
                      />
                    )}
                    
                    {item.search_params?.media_type && (
                      <Chip
                        label={item.search_params.media_type}
                        size="small"
                        sx={{ mr: 1, mb: 0.5 }}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    
                    {item.search_params?.license_type && (
                      <Chip
                        label={`License: ${item.search_params.license_type}`}
                        size="small"
                        sx={{ mr: 1, mb: 0.5 }}
                      />
                    )}
                    
                    <Typography 
                      component="span" 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {formatDate(item.created_at)}
                    </Typography>
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <Box display="flex" alignItems="center">
                  <Tooltip title="Search again">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleSearchSelect(item)}
                      sx={{ mr: 1 }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete from history">
                    <IconButton 
                      edge="end" 
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deleteMutation.isLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
            
            {index < history.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default SearchHistory;