import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import SidebarCustomMode from '../components/SidebarCustomMode';
import CustomModeCanvas from '../components/CustomModeCanvas';
import { Box, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CustomModePage = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [customNodes, setCustomNodes] = useState([]);

  const addNode = ({ label, type, color }) => {
    const newNode = {
      id: `node-${customNodes.length + 1}`,
      data: { label },
      type: 'default', // Štandardný typ uzla ako v pôvodnom canvase
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      style: {
        backgroundColor: color,
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
      },
    };
    setCustomNodes((prevNodes) => [...prevNodes, newNode]);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Box
        sx={{
          width: sidebarVisible ? '300px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.3s ease-in-out',
          visibility: sidebarVisible ? 'visible' : 'hidden',
        }}
      >
        <SidebarCustomMode addNode={addNode} sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />
      </Box>

      {!sidebarVisible && (
        <IconButton
          onClick={() => setSidebarVisible(true)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: 16,
            transform: 'translateY(-50%)',
            zIndex: 1300,
            backgroundColor: '#e20074',
            color: 'white',
            borderRadius: '50%',
            width: 40,
            height: 40,
            boxShadow: 3,
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}

      <Box sx={{ flexGrow: 1 }}>
        <ReactFlowProvider>
          <CustomModeCanvas newNodes={customNodes} />
        </ReactFlowProvider>
      </Box>
    </div>
  );
};

export default CustomModePage;
