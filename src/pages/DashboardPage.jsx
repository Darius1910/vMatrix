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
  const [rawTopologyData, setRawTopologyData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  const transformTopologyForVisualization = (data, timestamp) => {
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
  
    return selectedTopology.data.map((org, orgIndex) => ({
      id: `org-${orgIndex}-${org.uuid}`,  // ✅ Zachovanie unikátneho ID
      label: org.name || `vOrg-${orgIndex}`,
      type: 'vOrg',
      children: org.vdcs?.map((vdc, vdcIndex) => ({
        id: `vdc-${orgIndex}-${vdcIndex}-${vdc.urn}`,  // ✅ Stabilné ID pre VDC
        label: vdc.name,
        type: 'vDC',
        children: [
          ...(vdc.vapps?.map((vApp, vAppIndex) => ({
            id: `vapp-${orgIndex}-${vdcIndex}-${vAppIndex}-${vApp.href}`,  // ✅ Stabilné ID pre vApp
            label: vApp.name,
            type: 'vApp',
            children: vApp.details?.VirtualMachines?.map((vm, vmIndex) => ({
              id: `vm-${orgIndex}-${vdcIndex}-${vAppIndex}-${vmIndex}-${vm.id}`,  // ✅ Unikátne ID pre VM
              label: vm.name,
              type: 'VM',
              children: vm.networks?.map((network, networkIndex) => {
                const networkId = `network-${orgIndex}-${vdcIndex}-${vAppIndex}-${vmIndex}-${networkIndex}-${network.networkName}`;
                const edgeGatewayNode = network.networkType === "NAT_ROUTED" && network.natRoutedNetwork
                  ? {
                      id: `edge-${networkId}-${network.natRoutedNetwork.edgeGatewayName}`,
                      label: network.natRoutedNetwork.edgeGatewayName || 'Edge Gateway',
                      type: 'EdgeGateway',
                    }
                  : null;
  
                return {
                  id: networkId,  // ✅ Unikátne ID pre sieť
                  label: network.networkName,
                  type: 'Network',
                  children: edgeGatewayNode ? [edgeGatewayNode] : [],
                };
              }),
            })),
          })) || []),
  
          ...(vdc.edgeGateways || []).map((edgeGateway, edgeGatewayIndex) => ({
            id: `edgeGateway-${orgIndex}-${vdcIndex}-${edgeGatewayIndex}-${edgeGateway.edgeGatewayName}`,  // ✅ Unikátne ID pre EdgeGateway
            label: edgeGateway.edgeGatewayName || `Edge Gateway ${edgeGatewayIndex}`,
            type: 'EdgeGateway',
          })),
        ],
      })) || [],
    }));
  };
  
  const transformTopologyForComparison = (data, timestamp) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('❌ Invalid or empty topology data:', data);
      return [];
    }
  
    const firstItem = data[0];
    if (!firstItem || !firstItem.topology || !Array.isArray(firstItem.topology)) {
      console.warn('❌ No valid topology found in the data structure:', firstItem);
      return [];
    }
  
    const selectedTopology = firstItem.topology.find(item =>
      new Date(item.timeStamp).toISOString().startsWith(new Date(timestamp).toISOString().slice(0, 19))
    );
  
    if (!selectedTopology) {
      console.warn(`❌ No topology found for selected timestamp: ${timestamp}`);
      return [];
    }
  
    return selectedTopology.data.map(org => ({
      id: org.uuid,
      name: org.name || 'Unnamed Org',
      type: 'vOrg',
      children: (org.vdcs || []).map(vdc => ({
        id: vdc.urn,
        name: vdc.name || 'Unnamed VDC',
        type: 'vDC',
        children: (vdc.vapps || []).map(vApp => ({
          id: vApp.href,
          name: vApp.name || 'Unnamed vApp',
          type: 'vApp',
          children: (vApp.details?.VirtualMachines || []).map(vm => ({
            id: vm.id,
            name: vm.name || 'Unnamed VM',
            type: 'VM',
            cpu: vm.details?.numCpu || 0,
            ram: vm.details?.RAM || 0,
            children: (vm.networks || []).map(network => ({
              id: `${vm.id}-network-${network.networkName}`,
              name: network.networkName || 'Unnamed Network',
              type: 'Network',
              ipAddress: network.ipAddress || "N/A",
              mac: network.MAC || "N/A",
              adapter: network.adapter || "N/A",
              networkType: network.networkType || "UNKNOWN",
              edgeGateway: network.networkType === "NAT_ROUTED" && network.natRoutedNetwork
                ? {
                    id: `edge-${network.natRoutedNetwork.edgeGatewayName}`,
                    name: network.natRoutedNetwork.edgeGatewayName || 'Edge Gateway',
                    type: 'EdgeGateway'
                  }
                : null
            }))
          }))
        }))
      }))
    }));
  };
  
  const fetchData = async (uuid, timestamp) => {
    try {
      setTopologyData([]); 
      setRawTopologyData([]); // ✅ Teraz už existuje
  
      if (!uuid || !timestamp) {
        console.warn("No UUID or timestamp provided. Clearing topology.");
        return;
      }
  
      const response = await getAllTopologyByTimestamp(uuid, timestamp);
      const data = response.data;
  
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("No data found for selected vOrg or timestamp.");
        setTopologyData([]);
        return;
      }
  
      const transformedDataVisualization = transformTopologyForVisualization(data, timestamp);
      const transformedDataComparison = transformTopologyForComparison(data, timestamp);
  
      setTopologyData(transformedDataVisualization); 
      setRawTopologyData(transformedDataComparison); 
    } catch (error) {
      console.error("Failed to fetch topology data:", error);
      setTopologyData([]);
    }
  };
  
  const fetchDataWithComparison = async (uuid, timestamp1, timestamp2) => {
    console.log(`🕒 Fetching comparison for timestamps: ${timestamp1} vs ${timestamp2}`);
    
    try {
      if (!uuid || !timestamp1 || !timestamp2) {
        console.warn("⚠️ No valid UUID or timestamps provided for comparison.");
        return;
      }

      const response2 = await getAllTopologyByTimestamp(uuid, timestamp2);
      const data2 = response2.data;

      if (!data2) {
        console.warn("⚠️ No data found for second timestamp.");
        return;
      }

      const transformedData2 = transformTopologyForComparison(data2, timestamp2);

      console.log("✅ rawTopologyData (first timestamp):", rawTopologyData);
      console.log("✅ comparisonData (second timestamp):", transformedData2);

      setComparisonData(transformedData2); // ✅ This must trigger the `useEffect` in `TopologyCanvas.jsx`
    } catch (error) {
      console.error("❌ Failed to fetch comparison topology data:", error);
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
          width: sidebarVisible ? '350px' : '0px',
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
          <TopologyCanvas topology={topologyData} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes}  comparisonData={comparisonData} rawTopologyData={rawTopologyData}/>
        </ReactFlowProvider>
      </Box>
    </div>
  );
};

export default DashboardPage;