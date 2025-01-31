import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Switch } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import DarkModeIcon from '@mui/icons-material/Brightness4';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeProvider';

const MainPage = () => {
  const { user, logout } = useAuth(); // User meno a logout
  const { isDarkMode, toggleTheme } = useTheme(); // Dark Mode toggle
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
      <AppBar position="static" sx={{ height: '64px', flexShrink: 0 }}>
        <Toolbar sx={{ minHeight: '64px', display: 'flex', justifyContent: 'space-between' }}>
          {/* Odkazy vľavo */}
          <Box display="flex" alignItems="center">
            <Typography variant="h4" fontWeight="bold" sx={{ mr: 2 }}>
              vMatrix
            </Typography>
            <Button color="inherit" component={Link} to="/main/dash">
              DashBoard
            </Button>
            <Button color="inherit" component={Link} to="/main/cronJobs">
              CronJobs
            </Button>
          </Box>

          {/* Užívateľské meno a nastavenia */}
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user?.username || 'Guest'}
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <SettingsIcon />
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
      >
        <MenuItem>
          <DarkModeIcon sx={{ mr: 1 }} />
          Dark Mode
          <Switch checked={isDarkMode} onChange={toggleTheme} />
        </MenuItem>
        <MenuItem onClick={logout}>
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
