// src/components/MediaCard.jsx
import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Dialog,
  DialogContent,
  Link,
  CircularProgress,
  Collapse,
  Divider,
  Button,
  Alert
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  OpenInNew as OpenInNewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MusicNote as MusicNoteIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from 'react-query';
import { createBookmark, deleteBookmark } from '../services/bookmarkService';
import { useUser, SignInButton } from '@clerk/clerk-react';

/**
 * MediaCard component
 * Displays a media item (image or audio) with actions
 */
const MediaCard = ({ 
  item, 
  isBookmarked = false, 
  onBookmarkChange = () => {},
  showDetailedView = false
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const queryClient = useQueryClient();
  const { isSignedIn } = useUser();
  
  // Get item properties with fallbacks
  const {
    id,
    title = 'Untitled',
    creator = 'Unknown Creator',
    license = 'Unknown License',
    license_url = '#',
    provider = 'unknown',
    thumbnail = '',
    url = '',
    foreign_landing_url = '',
    tags = [],
    audio_set = null,
    detail_url = '',
    related_url = '',
    filesize = '',
    filetype = '',
    duration = '',
    waveform = ''
  } = item;
  
  // Determine media type and URL
  const isAudio = item.hasOwnProperty('audio_url') || provider === 'audio';
  const mediaUrl = item.url || item.image_url || item.audio_url || thumbnail || foreign_landing_url;
  const mediaType = isAudio ? 'audio' : 'images';
  
  // Format license display
  const licenseDisplay = license ? license.replace('cc-', '').toUpperCase() : 'Unknown License';
  
  // Extract tags for display
  const displayTags = Array.isArray(tags) 
    ? tags.slice(0, 3) 
    : (typeof tags === 'object' && tags !== null) 
      ? Object.values(tags).slice(0, 3) 
      : [];
  
  // Bookmark mutation
  const bookmarkMutation = useMutation(
    isBookmarked ? 
      () => deleteBookmark(id) : 
      () => createBookmark({
        mediaId: id,
        mediaUrl,
        mediaType,
        mediaTitle: title,
        mediaCreator: creator,
        mediaLicense: license
      }),
    {
      onSuccess: () => {
        // Update bookmarks list
        queryClient.invalidateQueries('bookmarks');
        onBookmarkChange(id, !isBookmarked);
      },
      onError: (error) => {
        // Show auth error if unauthenticated
        if (error.response?.status === 401 || error.response?.status === 422) {
          setShowAuthAlert(true);
        }
      }
    }
  );
  
  // Toggle bookmark status
  const toggleBookmark = () => {
    if (!isSignedIn) {
      setShowAuthAlert(true);
      return;
    }
    bookmarkMutation.mutate();
  };
  
  // Toggle details expansion
  const toggleDetails = () => {
    setDetailsOpen(!detailsOpen);
  };
  
  // Open media dialog
  const openDialog = () => {
    setDialogOpen(true);
  };
  
  // Close media dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setIsPlaying(false);
    setShowAuthAlert(false);
  };
  
  // Toggle audio playback
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Get preview display
  const getPreview = () => {
    if (isAudio) {
      return (
        <Box
          sx={{
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <MusicNoteIcon sx={{ fontSize: 60, color: '#757575', opacity: 0.5 }} />
          {waveform && (
            <Box 
              component="img" 
              src={waveform} 
              alt="Audio waveform" 
              sx={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.7
              }} 
            />
          )}
        </Box>
      );
    }
    return (
      <CardMedia
        component="img"
        height={140}
        image={mediaUrl}
        alt={title}
        onClick={openDialog}
        sx={{ 
          cursor: 'pointer',
          objectFit: 'cover',
          '&:hover': { 
            filter: 'brightness(1.1)' 
          }
        }}
      />
    );
  };
  
  return (
    <>
      <Card 
        elevation={2}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        {/* Preview */}
        {getPreview()}
        
        {/* Content */}
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            gutterBottom 
            noWrap 
            sx={{ fontSize: '1.1rem' }}
          >
            {title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            noWrap
          >
            {creator}
          </Typography>
          
          <Typography 
            variant="caption" 
            color="text.secondary" 
            component="div"
            sx={{ mt: 1 }}
          >
            <Link 
              href={license_url} 
              target="_blank" 
              rel="noopener" 
              underline="hover"
              color="inherit"
            >
              {licenseDisplay}
            </Link> • {provider}
          </Typography>
        </CardContent>
        
        {/* Actions */}
        <CardActions disableSpacing>
          {/* Bookmark button */}
          <Tooltip title={isBookmarked ? "Remove bookmark" : "Add bookmark"}>
            <IconButton 
              onClick={toggleBookmark}
              color={isBookmarked ? "primary" : "default"}
              disabled={bookmarkMutation.isLoading}
            >
              {bookmarkMutation.isLoading ? (
                <CircularProgress size={20} />
              ) : isBookmarked ? (
                <BookmarkIcon />
              ) : (
                <BookmarkBorderIcon />
              )}
            </IconButton>
          </Tooltip>
          
          {/* View details button */}
          <Tooltip title="View details">
            <IconButton onClick={openDialog}>
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
          
          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Show more details button */}
          {!showDetailedView && (
            <Tooltip title={detailsOpen ? "Hide details" : "Show details"}>
              <IconButton onClick={toggleDetails}>
                {detailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
        
        {/* Expandable details */}
        {!showDetailedView && (
          <Collapse in={detailsOpen} timeout="auto" unmountOnExit>
            <Divider />
            <Box sx={{ p: 2 }}>
              {/* Tags */}
              {displayTags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {displayTags.map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={typeof tag === 'object' ? tag.name : tag} 
                        size="small" 
                        variant="outlined" 
                        sx={{ margin: '2px' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* Audio specific details */}
              {isAudio && duration && (
                <Typography variant="body2" color="text.secondary">
                  Duration: {duration}
                </Typography>
              )}
              
              {/* Links */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </Button>
                
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<InfoIcon />}
                  href={foreign_landing_url || detail_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source
                </Button>
              </Box>
            </Box>
          </Collapse>
        )}
      </Card>
      
      {/* Dialog for expanded view */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 3 }}>
          {/* Authentication Alert */}
          {showAuthAlert && (
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
              Please sign in to bookmark media items.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Media preview */}
            <Box sx={{ flex: '1 1 60%' }}>
              {isAudio ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}
                >
                  <MusicNoteIcon sx={{ fontSize: 80, color: '#2196f3', mb: 2 }} />
                  
                  <audio
                    controls
                    src={mediaUrl}
                    style={{ width: '100%', marginBottom: '16px' }}
                    autoPlay={isPlaying}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  
                  {waveform && (
                    <Box 
                      component="img" 
                      src={waveform} 
                      alt="Audio waveform" 
                      sx={{ 
                        width: '100%',
                        height: '60px',
                        objectFit: 'cover'
                      }} 
                    />
                  )}
                </Box>
              ) : (
                <Box 
                  component="img"
                  src={mediaUrl}
                  alt={title}
                  sx={{
                    width: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    borderRadius: 1,
                    backgroundColor: '#f5f5f5'
                  }}
                />
              )}
            </Box>
            
            {/* Media details */}
            <Box sx={{ flex: '1 1 40%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {title}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                {creator}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>License:</strong>{' '}
                  <Link 
                    href={license_url} 
                    target="_blank" 
                    rel="noopener"
                    underline="hover"
                  >
                    {licenseDisplay}
                  </Link>
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Source:</strong> {provider}
                </Typography>
                
                {filesize && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Size:</strong> {filesize}
                  </Typography>
                )}
                
                {filetype && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Type:</strong> {filetype}
                  </Typography>
                )}
                
                {duration && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Duration:</strong> {duration}
                  </Typography>
                )}
              </Box>
              
              {/* Tags */}
              {displayTags.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Tags:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {displayTags.map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={typeof tag === 'object' ? tag.name : tag} 
                        size="small" 
                        sx={{ margin: '2px' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* Actions */}
              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<DownloadIcon />}
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  onClick={toggleBookmark}
                  disabled={bookmarkMutation.isLoading}
                >
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
              </Box>
              
              <Button
                variant="text"
                startIcon={<OpenInNewIcon />}
                href={foreign_landing_url || detail_url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 2 }}
              >
                View Original Source
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaCard;