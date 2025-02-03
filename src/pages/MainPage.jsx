import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Switch, Avatar } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import DarkModeIcon from '@mui/icons-material/Brightness4';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeProvider';

const MainPage = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const location = useLocation();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        height: '100vh', 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Navbar */}
      <AppBar 
        position="static" 
        sx={{ 
          height: '64px', 
          flexShrink: 0, 
          backgroundColor: '#e20074', // Magentová farba navbaru
          color: 'white', // Biela farba textu
        }}
      >
        <Toolbar sx={{ minHeight: '64px', display: 'flex', justifyContent: 'space-between' }}>
          {/* Odkazy vľavo */}
          <Box display="flex" alignItems="center">
            <Typography variant="h4" fontWeight="bold" sx={{ mr: 3 }}>
              vMatrix
            </Typography>

            {/* Navigačné tlačidlá */}
            {[
              { label: 'DashBoard', path: '/main/dash' },
              { label: 'CronJobs', path: '/main/cronJobs' }
            ].map(({ label, path }) => (
              <Button
                key={path}
                component={Link}
                to={path}
                sx={{
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: location.pathname === path ? 'bold' : 'normal',
                  borderRadius: '8px',
                  paddingX: 2,
                  paddingY: 1,
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Jemný hover efekt
                  },
                  '&::after': location.pathname === path ? {
                    content: '""',
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'white',
                    borderRadius: '2px',
                  } : {},
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* Užívateľské meno a nastavenia */}
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleMenuOpen} sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'white', color: '#e20074', fontWeight: 'bold' }}>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'G'}
              </Avatar>
              <Typography variant="body1" sx={{ fontWeight: '500' }}>
                {user?.username ?? 'Guest'}
              </Typography>
              <ArrowDropDownIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{ mt: 1 }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {user?.username ?? 'Guest'}
          </Typography>
        </MenuItem>
        <MenuItem onClick={toggleTheme}>
          <DarkModeIcon sx={{ mr: 1 }} />
          Dark Mode
          <Switch checked={isDarkMode} onChange={toggleTheme} sx={{ ml: 'auto' }} />
        </MenuItem>
        <MenuItem onClick={logout} sx={{ color: 'red' }}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Obsah stránky */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainPage;
