import React, { useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// Stronger colors for nodes
const colorMap = {
  vOrg: '#2196F3',      // Strong Blue
  vDC: '#4CAF50',       // Strong Green
  vApp: '#FFC107',      // Strong Yellow
  VM: '#F44336',        // Strong Red
  Network: '#9C27B0',   // Strong Purple
};

// Dagre layout function
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedNodesAndEdges = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // Update position
    node.position = {
      x: nodeWithPosition.x - 75, // Centering node
      y: nodeWithPosition.y - 25, // Centering node
    };
  });

  return { nodes, edges };
};

const TopologyCanvas = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data) return;

    const { topology } = data;
    const newNodes = [];
    const newEdges = [];

    // Add vOrg Nodes
    topology.forEach((org, orgIndex) => {
      const orgId = `org-${orgIndex}`;
      const orgName = org.data[0]?.name || `vOrg-${orgIndex}`; // Correct vOrg name extraction
      newNodes.push({
        id: orgId,
        type: 'default',
        data: { label: orgName },
        style: { backgroundColor: colorMap.vOrg },
      });

      // Add vDCs, vApps, VMs, and Networks
      org.data[0]?.vdcs.forEach((vdc, vdcIndex) => {
        const vdcId = `${orgId}-vdc-${vdcIndex}`;
        newNodes.push({
          id: vdcId,
          type: 'default',
          data: { label: vdc.name },
          style: { backgroundColor: colorMap.vDC },
        });
        newEdges.push({ id: `${orgId}-${vdcId}`, source: orgId, target: vdcId });

        vdc.vapps.forEach((vApp, vAppIndex) => {
          const vAppId = `${vdcId}-vApp-${vAppIndex}`;
          newNodes.push({
            id: vAppId,
            type: 'default',
            data: { label: vApp.name },
            style: { backgroundColor: colorMap.vApp },
          });
          newEdges.push({ id: `${vdcId}-${vAppId}`, source: vdcId, target: vAppId });

          vApp.details.VirtualMachines.forEach((vm, vmIndex) => {
            const vmId = `${vAppId}-vm-${vmIndex}`;
            newNodes.push({
              id: vmId,
              type: 'default',
              data: { label: vm.name },
              style: { backgroundColor: colorMap.VM },
            });
            newEdges.push({ id: `${vAppId}-${vmId}`, source: vAppId, target: vmId });

            vm.networks.forEach((network, networkIndex) => {
              const networkId = `${vmId}-network-${networkIndex}`;
              newNodes.push({
                id: networkId,
                type: 'default',
                data: { label: network.networkName },
                style: { backgroundColor: colorMap.Network },
              });
              newEdges.push({
                id: `${vmId}-${networkId}`,
                source: vmId,
                target: networkId,
              });
            });
          });
        });
      });
    });

    const layouted = getLayoutedNodesAndEdges(newNodes, newEdges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [data]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(250, 250, 250, 0.95)',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          zIndex: 10,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
        }}
      >
        <strong
          style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            color: '#000',
          }}
        >
          Legend
        </strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            { label: 'vOrg', color: colorMap.vOrg },
            { label: 'vDC', color: colorMap.vDC },
            { label: 'vApp', color: colorMap.vApp },
            { label: 'VM', color: colorMap.VM },
            { label: 'Network', color: colorMap.Network },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: color,
                }}
              ></div>
              <span style={{ fontSize: '12px', color: '#333' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* ReactFlow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default TopologyCanvas;
