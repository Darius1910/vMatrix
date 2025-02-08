import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import { ExpandLess, ExpandMore, ChevronLeft } from '@mui/icons-material';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import Scrollbar from '../components/Scrollbar';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 300;

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

const Sidebar = ({ topology = [], selectedNodes = [], setSelectedNodes, sidebarVisible, setSidebarVisible }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTypeFilterChange = (event) => {
    setSelectedTypes(event.target.value);
  };

  const handleCheckboxChange = (id, e) => {
    setSelectedNodes((prev = []) => {
      const newSelection = new Set(prev);
      if (e.target.checked) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return Array.from(newSelection);
    });
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

  const isAllSelected = selectedNodes.length > 0 && selectedNodes.length === collectAllNodeIds(topology).length;
  const isIndeterminate = selectedNodes.length > 0 && selectedNodes.length < collectAllNodeIds(topology).length;

  const filterTopology = (nodes, searchTerm, selectedTypes) => {
    return nodes
      .map((node) => {
        const matchLabel = node.label.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = selectedTypes.length === 0 || selectedTypes.includes(node.type);
        const filteredChildren = filterTopology(node.children || [], searchTerm, selectedTypes);

        if ((matchLabel && matchType) || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren, isHighlighted: searchTerm.length > 0 && matchLabel };
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredTopology = filterTopology(topology, searchTerm, selectedTypes);

  useEffect(() => {
    let expandedNodes = {};
    if (searchTerm || selectedTypes.length > 0) {
      const expandNodes = (nodes) => {
        nodes.forEach((node) => {
          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            expandedNodes[node.id] = true;
            expandNodes(node.children);
          }
        });
      };
      expandNodes(filteredTopology);
    }
    setExpanded(expandedNodes);
  }, [searchTerm, selectedTypes, topology]);

  const renderTree = (nodes = [], level = 0, parentColor = null) => {
    return nodes.map((node) => {
      if (!node || !node.id || !node.label) return null;

      const nodeId = node.id;
      const isExpanded = expanded[nodeId] || false;
      const children = node.children || [];
      const IconComponent = typeIcons[node.type] || null;
      const color = typeColors[node.type] || parentColor || theme.palette.text.primary;
      const isHighlighted = node.isHighlighted;

      return (
        <Box key={nodeId}>
          <ListItem
            disableGutters
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              backgroundColor: isHighlighted ? 'rgba(33, 150, 243, 0.2)' : 'inherit',
              '&:hover': { backgroundColor: isHighlighted ? 'rgba(33, 150, 243, 0.3)' : theme.palette.action.hover, borderRadius: '4px' },
              borderLeft: level > 0 ? `4px solid ${color}` : 'none',
              paddingLeft: level > 0 ? '8px' : '0px',
            }}
          >
            <ListItemIcon sx={{ minWidth: '28px' }}>
              {IconComponent && <IconComponent sx={{ color, fontSize: 18 }} />}
            </ListItemIcon>
            <Checkbox
              checked={Boolean(selectedNodes?.includes(nodeId))}
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
                  fontWeight: children.length > 0 ? 'bold' : 'normal',
                  color: theme.palette.text.primary,
                }}
              />
            </Tooltip>
            {children.length > 0 && (
              <IconButton size="small" onClick={() => toggleExpand(nodeId)} color="inherit">
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
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', }}>
        <Typography variant="h6" flex="1" fontWeight="bold" color="text.primary">
          Topology
        </Typography>
        <IconButton onClick={() => setSidebarVisible(false)} color="inherit">
          <ChevronLeft />
        </IconButton>
      </Box>
      <Divider sx={{ backgroundColor: theme.palette.divider }} />

      <Box sx={{ padding: 1 }}>
        <TextField fullWidth variant="outlined" size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </Box>

      <Box sx={{ padding: 1 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filter</InputLabel>
          <Select multiple value={selectedTypes} onChange={handleTypeFilterChange}>
            {Object.keys(typeIcons).map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ paddingX: 1, paddingY: 1, display: 'flex', alignItems: 'center' }}>
        <Checkbox checked={isAllSelected} indeterminate={isIndeterminate} onChange={handleSelectAllChange} />
        <Typography variant="body2">Select All</Typography>
      </Box>

      <Scrollbar style={{ flexGrow: 1 }}>
        <List>{renderTree(filteredTopology)}</List>
      </Scrollbar>
    </Drawer>
  );
};

export default Sidebar;
