import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import Sidebar from '../components/Sidebar';
import TopologyCanvas from '../components/TopologyCanvas';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [topologyData, setTopologyData] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState(['org-0']); // Default vOrg selected

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/src/data/data.json');
        const data = await response.json();

        // Transform data into a hierarchy format
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
    <div className="dashboard-container" style={{ display: 'flex' }}>
      <Sidebar
        topology={topologyData}
        selectedNodes={selectedNodes}
        setSelectedNodes={setSelectedNodes}
      />
      <div className="canvas-container" style={{ flexGrow: 1 }}>
        <ReactFlowProvider>
          <TopologyCanvas topology={topologyData} selectedNodes={selectedNodes} />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default DashboardPage;
