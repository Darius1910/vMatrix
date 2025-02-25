import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  IconButton,
  TextField,
  Button,
} from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';

const drawerWidth = 300;

const objectTypes = [
  { type: 'vOrg', label: 'vOrg', color: '#2196F3' },
  { type: 'vDC', label: 'vDC', color: '#4CAF50' },
  { type: 'vApp', label: 'vApp', color: '#FFC107' },
  { type: 'VM', label: 'VM', color: '#F44336' },
  { type: 'Network', label: 'Network', color: '#9C27B0' },
  { type: 'EdgeGateway', label: 'EdgeGateway', color: '#607D8B' },
];

const SidebarCustomMode = ({ addNode, sidebarVisible, setSidebarVisible }) => {
  const [nodeName, setNodeName] = useState('Test');
  const [customColor, setCustomColor] = useState('#e20074');

  const handleAddNode = (type, color) => {
    if (!nodeName.trim()) return;
    addNode({ label: nodeName, type, color });
    setNodeName('Test');

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
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <Typography variant="h6" fontWeight="bold">
          Custom Mode
        </Typography>
        <IconButton onClick={() => setSidebarVisible(false)}>
          <ChevronLeft />
        </IconButton>
      </Box>
      <Divider sx={{ marginBottom: '8px' }} />

      {/* Node name input */}
      <TextField
        fullWidth
        label="Node Name"
        variant="outlined"
        size="small"
        placeholder="Enter node name..."
        value={nodeName}
        onChange={(e) => setNodeName(e.target.value)}
        sx={{ marginBottom: '8px' }}
      />

      {/* Buttons for adding predefined nodes and custom node */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {objectTypes.map(({ type, label, color }) => (
          <Button
            key={type}
            variant="contained"
            sx={{
              backgroundColor: color,
              color: 'white',
              '&:hover': { backgroundColor: color },
              fontSize: '0.85rem',
              padding: '6px 12px',
            }}
            onClick={() => handleAddNode(type, color)}
            disabled={!nodeName.trim()}
          >
            Add {label}
          </Button>
        ))}

        {/* Custom Node (directly under normal nodes without extra space) */}
        <TextField
          type="color"
          fullWidth
          variant="outlined"
          size="small"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          sx={{ padding: '4px', marginTop: '6px' }}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: customColor,
            color: 'white',
            fontSize: '0.85rem',
            padding: '6px 12px',
            marginTop: '6px',
          }}
          onClick={() => handleAddNode('Custom', customColor)}
          disabled={!nodeName.trim()}
        >
          Add Custom Node
        </Button>
      </Box>
    </Drawer>
  );
};

export default SidebarCustomMode;
