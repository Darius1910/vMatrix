import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton
} from '@mui/material';
import { ExpandLess, ExpandMore, ChevronLeft, ChevronRight } from '@mui/icons-material';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import Scrollbar from '../components/Scrollbar';
import '../styles/Sidebar.css';

const typeIcons = {
  vOrg: CloudOutlinedIcon,
  vDC: StorageOutlinedIcon,
  vApp: AppsOutlinedIcon,
  VM: LaptopOutlinedIcon,
  Network: NetworkCheckOutlinedIcon,
  EdgeGateway: RouterOutlinedIcon,
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
  const [expanded, setExpanded] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);

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

  const handleSelectAllChange = (isChecked) => {
    if (isChecked) {
      setSelectedNodes(collectAllNodeIds(topology));
    } else {
      setSelectedNodes([]);
    }
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
      const IconComponent = typeIcons[node.type] || null;
      const color = typeColors[node.type] || '#000';

      return (
        <Box key={nodeId} className="sidebar-node" sx={{ marginLeft: `${level * 10}px` }}>
          <ListItem className="sidebar-list-item">
            <ListItemIcon>
              {IconComponent && <IconComponent sx={{ color }} />}
            </ListItemIcon>
            <Checkbox
              checked={selectedNodes.includes(nodeId)}
              onChange={(e) => handleCheckboxChange(nodeId, e.target.checked)}
            />
            <ListItemText primary={node.label} />
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

  return (
    <>
      {!sidebarVisible && (
        <IconButton
          onClick={() => setSidebarVisible(true)}
          className="sidebar-toggle-open"
        >
          <ChevronRight />
        </IconButton>
      )}

      {sidebarVisible && (
        <Box className="sidebar-container">
          <Box className="sidebar-header-container">
            <Typography className="sidebar-header">vMatrix</Typography>
            <IconButton
              onClick={() => setSidebarVisible(false)}
              className="sidebar-toggle-close"
            >
              <ChevronLeft />
            </IconButton>
          </Box>

          <Divider />

          <Box className="sidebar-select-all">
            <Checkbox
              checked={selectedNodes.length > 0 && selectedNodes.length === collectAllNodeIds(topology).length}
              indeterminate={selectedNodes.length > 0 && selectedNodes.length < collectAllNodeIds(topology).length}
              onChange={(e) => handleSelectAllChange(e.target.checked)}
            />
            <Typography variant="body2">Select All</Typography>
          </Box>

          <Scrollbar className="sidebar-scrollable">
            <List>{renderTree(topology)}</List>
          </Scrollbar>
        </Box>
      )}
    </>
  );
};

export default Sidebar;
