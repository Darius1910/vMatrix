import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import Sidebar from '../components/Sidebar';
import TopologyCanvas from '../components/TopologyCanvas';
import Loader from '../components/Loader';
import { Box, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DashboardPage = () => {
  const [topologyData, setTopologyData] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [loading, setLoading] = useState(true); // ✅ Opravený názov stavu

  useEffect(() => {
    const fetchTopology = async () => {
      setLoading(true); // ✅ Správne použitie `setLoading`
      try {
        const response = await fetch('/api/topology');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const topologyData = await response.json();
        console.log('Fetched topology:', topologyData);

        if (!Array.isArray(topologyData) || topologyData.length === 0) {
          console.warn('Topology data is empty or not in expected format');
          setTopologyData([]);
        } else {
          setTopologyData(transformTopology(topologyData));
        }
      } catch (error) {
        console.error('Failed to fetch topology data:', error);
        setTopologyData([]);
      } finally {
        setLoading(false); // ✅ Správne použitie `setLoading`
      }
    };

    fetchTopology();
  }, []);

  const transformTopology = (data) => {
    return data.map((org, index) => ({
      id: `org-${index}`,
      label: org.name || `vOrg-${index}`,
      type: 'vOrg',
      children: (org.vdcs ?? []).map((vdc, vdcIndex) => ({
        id: `org-${index}-vdc-${vdcIndex}`,
        label: vdc.name ?? `vDC-${vdcIndex}`,
        type: 'vDC',
        children: (vdc.vapps ?? []).map((vApp, vAppIndex) => ({
          id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}`,
          label: vApp.name ?? `vApp-${vAppIndex}`,
          type: 'vApp',
          children: (vApp.details?.VirtualMachines ?? []).map((vm, vmIndex) => ({
            id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}`,
            label: vm.name ?? `VM-${vmIndex}`,
            type: 'VM',
            children: (vm.networks ?? []).map((network, networkIndex) => ({
              id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}-network-${networkIndex}`,
              label: network.networkName ?? `Network-${networkIndex}`,
              type: 'Network',
              children: (network.edgeGateway ? [{
                id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}-network-${networkIndex}-edgeGateway`,
                label: network.edgeGateway.edgeGatewayName || 'Edge Gateway',
                type: 'EdgeGateway',
              }] : [])
            }))
          }))
        }))
      }))
    }));
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh' }}>
      {loading && <Loader />} {/* ✅ Loader sa zobrazí iba pri `loading === true` */}

      {/* Sidebar */}
      <Box
        sx={{
          width: sidebarVisible ? '300px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.3s ease-in-out',
          visibility: sidebarVisible ? 'visible' : 'hidden',
        }}
      >
        <Sidebar
          topology={topologyData}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
          sidebarVisible={sidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
      </Box>

      {/* Ikona na otvorenie Sidebaru */}
      {!sidebarVisible && (
        <IconButton
          onClick={() => setSidebarVisible(true)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: 16,
            transform: 'translateY(-50%)',
            zIndex: 1300,
            backgroundColor: '#e02460',
            color: 'white',
            borderRadius: '50%',
            width: 40,
            height: 40,
            boxShadow: 3,
            transition: 'background-color 0.2s ease-in-out',
            '&:hover': { backgroundColor: '#c81e5b' },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}

      {/* ReactFlow Canvas */}
      <Box
        className="canvas-container"
        sx={{
          flexGrow: 1,
          transition: 'width 0.3s ease-in-out',
          width: sidebarVisible ? 'calc(100% - 300px)' : '100%',
        }}
      >
        <ReactFlowProvider>
          <TopologyCanvas
            topology={topologyData}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
          />
        </ReactFlowProvider>
      </Box>
    </div>
  );
};

export default DashboardPage;
