import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import Sidebar from '../components/Sidebar';
import TopologyCanvas from '../components/TopologyCanvas';
import { Box, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DashboardPage = () => {
  const [topologyData, setTopologyData] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState(['org-0']);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/src/data/data.json');
        const data = await response.json();

        const transformTopology = (data) => {
          return data.topology.map((org, index) => ({
            id: `org-${index}`,
            label: org.data[0]?.name || `vOrg-${index}`,
            type: 'vOrg',
            children: org.data[0]?.vdcs.map((vdc, vdcIndex) => ({
              id: `org-${index}-vdc-${vdcIndex}`,
              label: vdc.name,
              type: 'vDC',
              children: [
                ...(vdc.vapps.map((vApp, vAppIndex) => ({
                  id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}`,
                  label: vApp.name,
                  type: 'vApp',
                  children: vApp.details.VirtualMachines.map((vm, vmIndex) => ({
                    id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}`,
                    label: vm.name,
                    type: 'VM',
                    children: vm.networks.map((network, networkIndex) => ({
                      id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}-network-${networkIndex}`,
                      label: network.networkName,
                      type: 'Network',
                      children: network.edgeGateway
                        ? [{
                          id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}-network-${networkIndex}-edgeGateway`,
                          label: network.edgeGateway.edgeGatewayName || 'Edge Gateway',
                          type: 'EdgeGateway',
                        }]
                        : [],
                    })),
                  })),
                }))),

                ...(vdc.edgeGateways || []).map((edgeGateway, edgeGatewayIndex) => ({
                  id: `org-${index}-vdc-${vdcIndex}-edgeGateway-${edgeGatewayIndex}`,
                  label: edgeGateway.edgeGatewayName || `Edge Gateway ${edgeGatewayIndex}`,
                  type: 'EdgeGateway',
                })),
              ],
            })),
          }));
        };

        setTopologyData(transformTopology(data));
      } catch (error) {
        console.error('Failed to fetch topology data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar s animovanou šírkou */}
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

      {/* Ikona na zobrazenie sidebaru, keď je skrytý */}
      {!sidebarVisible && (
        <IconButton
          onClick={() => setSidebarVisible(true)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: 16,
            transform: 'translateY(-50%)',
            zIndex: 1300,
            backgroundColor: '#e02460', // Magentová farba
            color: 'white', // Biela farba ikony
            borderRadius: '50%', // Zaoblené tlačidlo
            width: 40,
            height: 40,
            boxShadow: 3,
            transition: 'background-color 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: '#c81e5b', // Tmavšia magenta pri hoveri
            },
          }}
        >
          <ChevronRightIcon /> {/* Biela šípka doprava */}
        </IconButton>
      )}

      {/* Hlavná topológia sa roztiahne na 100%, ak je sidebar skrytý */}
      <Box
        className="canvas-container"
        sx={{
          flexGrow: 1,
          transition: 'width 0.3s ease-in-out',
          width: sidebarVisible ? 'calc(100% - 300px)' : '100%',
        }}
      >
        <ReactFlowProvider>
          <TopologyCanvas topology={topologyData} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes} />
        </ReactFlowProvider>
      </Box>
    </div>
  );
};

export default DashboardPage;