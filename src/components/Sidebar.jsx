import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import { ExpandLess, ExpandMore, SettingsOutlined, LogoutOutlined } from '@mui/icons-material';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeProvider';
import '../styles/Sidebar.css';

const typeIcons = {
  vOrg: <CloudOutlinedIcon />,
  vDC: <StorageOutlinedIcon />,
  vApp: <AppsOutlinedIcon />,
  VM: <LaptopOutlinedIcon />,
  Network: <NetworkCheckOutlinedIcon />,
};

const typeColors = {
  vOrg: '#2196F3', // Blue
  vDC: '#4CAF50', // Green
  vApp: '#FFC107', // Yellow
  VM: '#F44336', // Red
  Network: '#9C27B0', // Purple
};

const Sidebar = ({ topology, selectedNodes, setSelectedNodes }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [sidebarWidth, setSidebarWidth] = useState(400); // Initial sidebar width

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckboxChange = (id, isChecked) => {
    setSelectedNodes((prev) => {
      const newSelection = new Set(prev);
      if (isChecked) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return Array.from(newSelection);
    });
  };

  const renderTree = (nodes = [], level = 0) => {
    return nodes.map((node) => {
      const nodeId = node.id;
      const isExpanded = expanded[nodeId] || false;
      const children = node.children || [];
      const icon = typeIcons[node.type] || null;
      const color = typeColors[node.type] || '#000'; // Default to black if type is unknown

      return (
        <Box key={nodeId} sx={{ marginLeft: `${level * 15}px` }}>
          <ListItem
            sx={{
              padding: '6px 14px',
              backgroundColor: selectedNodes.includes(nodeId) ? 'rgba(0, 123, 255, 0.1)' : 'inherit',
              borderRadius: '5px',
              '&:hover': { backgroundColor: 'rgba(0, 123, 255, 0.2)' },
            }}
          >
            <ListItemIcon sx={{ color }}>{icon}</ListItemIcon>
            <Checkbox
              checked={selectedNodes.includes(nodeId)}
              onChange={(e) => handleCheckboxChange(nodeId, e.target.checked)}
            />
            <ListItemText
              primary={node.label}
              sx={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#fff' : '#333', // Dynamic text color
              }}
            />
            {children.length > 0 && (
              <IconButton onClick={() => toggleExpand(nodeId)}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </ListItem>
          {children.length > 0 && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderTree(children, level + 1)}
              </List>
            </Collapse>
          )}
        </Box>
      );
    });
  };

  // Handle resizing the sidebar
  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const newWidth = Math.min(Math.max(e.clientX, 200), 600); // Horizontal resizing limits
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <Box
      className="sidebar-container"
      style={{
        width: `${sidebarWidth}px`,
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Header Section */}
      <Box>
        <Typography
          className="sidebar-header"
          sx={{
            fontWeight: 'bold',
            padding: '10px',
            color: '#e02460', // Magenta color for "vMatrix"
            textAlign: 'center',
          }}
        >
          vMatrix
        </Typography>
        <Divider className="sidebar-divider" />
        {/* Topology Section */}
        <Typography
          variant="h6"
          sx={{
            padding: '10px 0',
            color: isDarkMode ? '#fff' : '#333', // Dynamic text color
            textAlign: 'center', // Center-align the title
          }}
        >
          Topology Hierarchy
        </Typography>
        <Box
          className="custom-scrollbar"
          style={{
            overflowY: 'auto', // Vertical scrollbar only
            overflowX: 'hidden', // Disable horizontal scrollbar
            maxHeight: 'calc(100vh - 200px)', // Proper height adjustment
            padding: '0 5px',
          }}
        >
          <List>{renderTree(topology)}</List>
        </Box>
      </Box>

      {/* Footer Section */}
      <Box>
        <Divider className="sidebar-divider" />
        <Box className="sidebar-footer" sx={{ padding: '10px' }}>
          {/* Username */}
          <Typography
            className="user-name"
            sx={{
              fontSize: '14px',
              color: isDarkMode ? '#fff' : '#333', // Dynamic text color
            }}
          >
            {user?.username || 'Guest'}
          </Typography>
          <IconButton onClick={handleMenuOpen} className="footer-menu-button">
            <SettingsOutlined />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem>
              <Typography>Dark Mode</Typography>
              <Switch checked={isDarkMode} onChange={toggleTheme} />
            </MenuItem>
            <MenuItem onClick={logout}>
              <LogoutOutlined />
              <Typography>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Resizable Drag Handle */}
      <Box
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '5px',
          height: '100%',
          cursor: 'col-resize',
          zIndex: 100,
        }}
      />
    </Box>
  );
};

export default Sidebar;