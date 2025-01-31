import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import { ExpandLess, ExpandMore, ChevronLeft } from '@mui/icons-material';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import Scrollbar from '../components/Scrollbar'; // Import vlastného scrollbar komponentu
import { styled } from '@mui/system';

const drawerWidth = 300;

// Ikony a farby pre jednotlivé typy topológie
const typeIcons = {
  vOrg: CloudOutlinedIcon,
  vDC: StorageOutlinedIcon,
  vApp: AppsOutlinedIcon,
  VM: LaptopOutlinedIcon,
  Network: NetworkCheckOutlinedIcon,
  EdgeGateway: RouterOutlinedIcon,
};

const typeColors = {
  vOrg: '#1976D2',
  vDC: '#388E3C',
  vApp: '#FBC02D',
  VM: '#D32F2F',
  Network: '#7B1FA2',
  EdgeGateway: '#455A64',
};

const Sidebar = ({ topology = [], selectedNodes, setSelectedNodes, sidebarVisible, setSidebarVisible }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedNodes(collectAllNodeIds(topology));
    } else {
      setSelectedNodes([]);
    }
  };

  const handleCheckboxChange = (id, e) => {
    setSelectedNodes((prev) => {
      const newSelection = new Set(prev);
      if (e.target.checked) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return Array.from(newSelection);
    });
  };

  const renderTree = (nodes = [], level = 0, parentColor = null) => {
    return nodes.map((node) => {
      if (!node || !node.id || !node.label) return null; // Ochrana pred nesprávnymi dátami

      const nodeId = node.id;
      const isExpanded = expanded[nodeId] || false;
      const children = node.children || [];
      const IconComponent = typeIcons[node.type] || null;
      const color = typeColors[node.type] || parentColor || '#ccc'; // Farba pre farebný pásik

      return (
        <Box key={nodeId}>
          <ListItem
            disableGutters
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              '&:hover': { backgroundColor: '#f5f5f5', borderRadius: '4px' },
              borderLeft: level > 0 ? `4px solid ${color}` : 'none', // Pásik pre child elementy
              paddingLeft: level > 0 ? '8px' : '0px'
            }}
          >
            <ListItemIcon sx={{ minWidth: '28px' }}>
              {IconComponent && <IconComponent sx={{ color, fontSize: 18 }} />}
            </ListItemIcon>
            <Checkbox
              checked={selectedNodes.includes(nodeId)}
              onChange={(e) => handleCheckboxChange(nodeId, e)}
              size="small"
            />
            <Tooltip title={node.label} arrow>
              <ListItemText
                primary={node.label}
                sx={{
                  flexGrow: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '14px',
                  fontWeight: children.length > 0 ? 'bold' : 'normal', // Parent bude tučný
                }}
              />
            </Tooltip>
            {children.length > 0 && (
              <IconButton size="small" onClick={() => toggleExpand(nodeId)}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </ListItem>
          {children.length > 0 && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>{renderTree(children, level + 1, color)}</List>
            </Collapse>
          )}
        </Box>
      );
    });
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarVisible}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100% - 64px)',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #ddd',
        },
      }}
    >
      {/* Header s názvom a tlačidlom */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingX: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          Topology Filter
        </Typography>
        <IconButton onClick={() => setSidebarVisible(false)}>
          <ChevronLeft />
        </IconButton>
      </Box>
      <Divider />

      {/* Výber všetkých uzlov */}
      <Box sx={{ display: 'flex', alignItems: 'center', paddingX: 1, paddingY: 1 }}>
        <Checkbox
          checked={selectedNodes.length > 0 && selectedNodes.length === collectAllNodeIds(topology).length}
          indeterminate={selectedNodes.length > 0 && selectedNodes.length < collectAllNodeIds(topology).length}
          onChange={handleSelectAllChange}
        />
        <Typography variant="body2">Select All</Typography>
      </Box>
      <Divider />

      {/* Scrollovateľný zoznam topológie s vlastným scrollbarom */}
      <Scrollbar style={{ flexGrow: 1 }}>
        <List>{renderTree(topology)}</List>
      </Scrollbar>
    </Drawer>
  );
};

export default Sidebar;
