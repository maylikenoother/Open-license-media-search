// src/components/Navbar.jsx
import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Container,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Bookmark as BookmarkIcon,
  History as HistoryIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import logo from '../assets/logo.svg';

/**
 * Navbar component
 * Main navigation bar for the application
 */
const Navbar = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const isActive = (path) => location.pathname === path;
  
  // Navigation items
  const navItems = [
    { path: '/search', text: 'Search', icon: <SearchIcon /> },
    { path: '/bookmarks', text: 'Bookmarks', icon: <BookmarkIcon /> },
    { path: '/history', text: 'History', icon: <HistoryIcon /> }
  ];
  
  // Desktop navigation menu
  const DesktopNav = () => (
    <Box display="flex" alignItems="center">
      {navItems.map((item) => (
        <Button
          key={item.path}
          component={RouterLink}
          to={item.path}
          color="inherit"
          sx={{ 
            mx: 1,
            fontWeight: isActive(item.path) ? 'bold' : 'normal',
            borderBottom: isActive(item.path) ? '2px solid white' : 'none',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
          startIcon={item.icon}
        >
          {item.text}
        </Button>
      ))}
    </Box>
  );
  
  // Mobile navigation drawer content
  const DrawerContent = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="Logo" style={{ width: 40, marginRight: 10 }} />
        <Typography variant="h6" component="div">
          OLM Search
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.path}
            button
            component={RouterLink}
            to={item.path}
            selected={isActive(item.path)}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="contained" color="primary" fullWidth>
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
      </Box>
    </Box>
  );
  
  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <img 
              src={logo} 
              alt="OLM Search Logo" 
              style={{ 
                height: 40, 
                marginRight: 8 
              }} 
            />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              OLM Search
            </Typography>
          </Box>
          
          {/* Hamburger menu for mobile */}
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              {/* Navigation for desktop */}
              <Box sx={{ flexGrow: 1 }}>
                <DesktopNav />
              </Box>
              
              {/* User authentication */}
              <Box>
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button color="inherit">Sign In</Button>
                  </SignInButton>
                </SignedOut>
              </Box>
            </>
          )}
          
          {/* Mobile navigation drawer */}
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer}
          >
            <DrawerContent />
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;