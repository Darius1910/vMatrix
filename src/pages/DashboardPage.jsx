import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import Sidebar from '../components/Sidebar';
import TopologyCanvas from '../components/TopologyCanvas';
import { Box, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getAllTopologyByTimestamp } from '../api';

const DashboardPage = () => {
  const [topologyData, setTopologyData] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState(['org-0']);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);



const transformTopology = (data, timestamp) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('Invalid or empty topology data:', data);
    return [];
  }

  const firstItem = data[0];
  if (!firstItem.topology || !Array.isArray(firstItem.topology)) {
    console.warn('No valid topology found in the data:', firstItem);
    return [];
  }

  const selectedTopology = firstItem.topology.find(item => item.timeStamp === timestamp);
  if (!selectedTopology) {
    console.warn('No topology found for selected timestamp:', timestamp);
    return [];
  }

  console.log("Selected Topology:", selectedTopology);

  return selectedTopology.data.map((org, index) => ({
    id: `org-${index}`,
    label: org.name || `vOrg-${index}`,
    type: 'vOrg',
    children: org.vdcs?.map((vdc, vdcIndex) => ({
      id: `org-${index}-vdc-${vdcIndex}`,
      label: vdc.name,
      type: 'vDC',
      children: [
        ...(vdc.vapps?.map((vApp, vAppIndex) => ({
          id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}`,
          label: vApp.name,
          type: 'vApp',
          children: vApp.details?.VirtualMachines?.map((vm, vmIndex) => ({
            id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}`,
            label: vm.name,
            type: 'VM',
            children: vm.networks?.map((network, networkIndex) => {
              const edgeGatewayNode = network.networkType === "NAT_ROUTED" && network.natRoutedNetwork
                ? {
                    id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}-network-${networkIndex}-edgeGateway`,
                    label: network.natRoutedNetwork.edgeGatewayName || 'Edge Gateway',
                    type: 'EdgeGateway',
                  }
                : null;

              return {
                id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}-network-${networkIndex}`,
                label: network.networkName,
                type: 'Network',
                children: edgeGatewayNode ? [edgeGatewayNode] : [],
              };
            }),
          })),
        })) || []),

        ...(vdc.edgeGateways || []).map((edgeGateway, edgeGatewayIndex) => ({
          id: `org-${index}-vdc-${vdcIndex}-edgeGateway-${edgeGatewayIndex}`,
          label: edgeGateway.edgeGatewayName || `Edge Gateway ${edgeGatewayIndex}`,
          type: 'EdgeGateway',
        })),
      ],
    })) || [],
  }));
};


  // ✅ Fetch Data volá transformTopology
  const fetchData = async (uuid, timestamp) => {
    try {
      setTopologyData([]); // ✅ Reset pred načítaním
  
      if (!uuid || !timestamp) {
        console.warn("No UUID or timestamp provided. Clearing topology.");
        return; // ✅ Pri prázdnych hodnotách zruší načítanie
      }
  
      const response = await getAllTopologyByTimestamp(uuid, timestamp);
      const data = response.data;
  
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("No data found for selected vOrg or timestamp.");
        setTopologyData([]); // ✅ Vymaže topológiu
        return;
      }
  
      const transformedData = transformTopology(data, timestamp);
      setTopologyData(transformedData);
    } catch (error) {
      console.error("Failed to fetch topology data:", error);
      setTopologyData([]); // ✅ Vyčistí aj pri chybe
    }
  };
  
const fetchDataWithComparison = async (uuid, timestamp1, timestamp2) => {
  try {
    if (!uuid || !timestamp1 || !timestamp2) {
      console.warn("No valid UUID or timestamps provided for comparison.");
      return;
    }

    const response1 = await getAllTopologyByTimestamp(uuid, timestamp1);
    const response2 = await getAllTopologyByTimestamp(uuid, timestamp2);

    const data1 = response1.data;
    const data2 = response2.data;

    if (!data1 || !data2) {
      console.warn("One of the timestamps has no data.");
      return;
    }

    const transformedData1 = transformTopology(data1, timestamp1);
    const transformedData2 = transformTopology(data2, timestamp2);

    setTopologyData(transformedData1);
    setComparisonData(transformedData2);
  } catch (error) {
    console.error("Failed to fetch comparison topology data:", error);
  }
};

  
  

  useEffect(() => {
    // Initial fetch with default UUID and timestamp
    fetchData('default-uuid', 'default-timestamp');
  }, []);

  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh' }}>
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
          fetchData={fetchData}
          fetchDataWithComparison={fetchDataWithComparison}
        />
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
            transition: 'background-color 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: '#c81e5b',
            },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}

      <Box
        className="canvas-container"
        sx={{
          flexGrow: 1,
          transition: 'width 0.3s ease-in-out',
          width: sidebarVisible ? 'calc(100% - 300px)' : '100%',
        }}
      >
        <ReactFlowProvider>
          <TopologyCanvas topology={topologyData} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes}  comparisonData={comparisonData}/>
        </ReactFlowProvider>
      </Box>
    </div>
  );
};

export default DashboardPage;