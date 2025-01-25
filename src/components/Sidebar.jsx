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
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined'; // Edge Gateway Icon
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeProvider';
import '../styles/Sidebar.css';

const typeIcons = {
  vOrg: <CloudOutlinedIcon />,
  vDC: <StorageOutlinedIcon />,
  vApp: <AppsOutlinedIcon />,
  VM: <LaptopOutlinedIcon />,
  Network: <NetworkCheckOutlinedIcon />,
  EdgeGateway: <RouterOutlinedIcon />,
};

const typeColors = {
  vOrg: '#2196F3',
  vDC: '#4CAF50',
  vApp: '#FFC107',
  VM: '#F44336',
  Network: '#9C27B0',
  EdgeGateway: '#607D8B',
};

const Sidebar = ({ topology, selectedNodes, setSelectedNodes }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [expanded, setExpanded] = useState({});
  const [sidebarWidth, setSidebarWidth] = useState(500);
  const [anchorEl, setAnchorEl] = useState(null);

  // Dropdown menu handlers
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

  const handleSelectAllChange = (isChecked) => {
    if (isChecked) {
      const collectAllNodeIds = (nodes) => {
        let ids = [];
        nodes.forEach((node) => {
          ids.push(node.id);
          if (node.children) {
            ids = ids.concat(collectAllNodeIds(node.children));
          }
        });
        return ids;
      };
      setSelectedNodes(collectAllNodeIds(topology));
    } else {
      setSelectedNodes([]);
    }
  };

  const renderTree = (nodes = [], level = 0) => {
    return nodes.map((node) => {
      const nodeId = node.id;
      const isExpanded = expanded[nodeId] || false;
      const children = node.children || [];
      const icon = typeIcons[node.type] || null;
      const color = typeColors[node.type] || '#000';

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
                color: isDarkMode ? '#fff' : '#333',
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

  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const newWidth = Math.min(Math.max(e.clientX, 200), 600);
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Check if all nodes are selected
  const collectAllNodeIds = (nodes) => {
    let ids = [];
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children) {
        ids = ids.concat(collectAllNodeIds(node.children));
      }
    });
    return ids;
  };

  const allNodeIds = collectAllNodeIds(topology);
  const areAllSelected = selectedNodes.length > 0 && selectedNodes.length === allNodeIds.length;

  return (
    <Box
      className="sidebar-container"
      style={{
        width: `${sidebarWidth}px`,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Header */}
      <Box>
        <Typography
          className="sidebar-header"
          sx={{
            fontWeight: 'bold',
            padding: '10px',
            color: '#e02460',
            textAlign: 'center',
          }}
        >
          vMatrix
        </Typography>
        <Divider className="sidebar-divider" />
        <Typography
          variant="h6"
          sx={{
            padding: '10px 0',
            color: isDarkMode ? '#fff' : '#333',
            textAlign: 'center',
          }}
        >
          Topology Hierarchy
        </Typography>

        {/* "Select All" Checkbox */}
        <Box sx={{ padding: '10px 20px' }}>
          <Checkbox
            checked={areAllSelected}
            indeterminate={selectedNodes.length > 0 && selectedNodes.length < allNodeIds.length}
            onChange={(e) => handleSelectAllChange(e.target.checked)}
          />
          <Typography variant="body2" sx={{ display: 'inline', marginLeft: '10px' }}>
            Select All
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        className="custom-scrollbar"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1,
          padding: '0 5px',
        }}
      >
        <List>{renderTree(topology)}</List>
      </Box>

      {/* Footer with Dropdown */}
      <Box
        className="sidebar-footer"
        sx={{
          padding: '10px',
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            color: isDarkMode ? '#fff' : '#333',
          }}
        >
          {user?.username || 'Guest'}
        </Typography>
        <Box>
          <IconButton onClick={handleMenuOpen}>
            <SettingsOutlined />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem>
              <Typography variant="body2">Dark Mode</Typography>
              <Switch checked={isDarkMode} onChange={toggleTheme} />
            </MenuItem>
            <MenuItem onClick={logout}>
              <LogoutOutlined />
              <Typography variant="body2" sx={{ marginLeft: '10px' }}>
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Resize Handle */}
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
