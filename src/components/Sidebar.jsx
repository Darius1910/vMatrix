// Sidebar.jsx (Frontend)
import React from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Switch,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../context/AuthContext'; // Use AuthContext to get the user
import { useTheme } from '../context/ThemeProvider'; // For dark mode handling
import '../styles/Sidebar.css';

const Sidebar = ({ filters, setFilters }) => {
  const { user, logout } = useAuth(); // Access the user from AuthContext
  const { isDarkMode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box className="sidebar-container">
      <Box>
        <Typography className="sidebar-header">vMatrix</Typography>
        <Divider className="sidebar-divider" />
        {/* Filter Section */}
      </Box>

      {/* Footer Section */}
      <Box>
        <Divider className="sidebar-divider" />
        <Box className="sidebar-footer">
          {/* Displaying username */}
          <Typography className="user-name">{user?.username || 'Guest'}</Typography>
          <IconButton
            onClick={handleMenuOpen}
            className="footer-menu-button"
          >
            <SettingsOutlinedIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem>
              <Typography>Dark Mode</Typography>
              <Switch checked={isDarkMode} onChange={toggleTheme} />
            </MenuItem>
            <MenuItem onClick={logout}>
              <LogoutOutlinedIcon />
              <Typography>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
