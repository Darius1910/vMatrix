import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined';

// Definícia farieb a ikon pre legendu
const typeIcons = {
  vOrg: <CloudOutlinedIcon />,
  vDC: <StorageOutlinedIcon />,
  vApp: <AppsOutlinedIcon />,
  VM: <LaptopOutlinedIcon />,
  Network: <NetworkCheckOutlinedIcon />,
};

const typeColors = {
  vOrg: '#2196F3', // Blue
  vDC: '#4CAF50', // Green
  vApp: '#FFC107', // Yellow
  VM: '#F44336', // Red
  Network: '#9C27B0', // Purple
};

// Funkcia na aplikovanie Dagre Layout
const getDagreLayoutedNodesAndEdges = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Nastavenie smeru a medzier
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  // Pridanie nodov do Dagre grafu
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  // Pridanie hrán do Dagre grafu
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Vypočítanie layoutu pomocou Dagre
  dagre.layout(dagreGraph);

  // Uloženie pozícií z Dagre do React Flow nodov
  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x, y },
      targetPosition: 'top',
      sourcePosition: 'bottom',
    };
  });

  return { nodes: layoutedNodes, edges };
};

const TopologyCanvas = ({ topology, selectedNodes, isDarkMode = false }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, getViewport } = useReactFlow();

  const rebuildTopology = () => {
    // Reset nodes and edges completely
    setNodes([]);
    setEdges([]);

    if (!topology || selectedNodes.length === 0) {
      fitView({ padding: 0.3 });
      return;
    }

    const newNodes = [];
    const newEdges = [];

    const traverseTopology = (node) => {
      if (selectedNodes.includes(node.id)) {
        newNodes.push({
          id: node.id,
          data: { label: node.label },
          style: { backgroundColor: typeColors[node.type] || '#cccccc' }, // Nastaviť farbu podľa typu
          position: { x: 0, y: 0 }, // Resetovať pozíciu
        });

        node.children?.forEach((child) => {
          if (selectedNodes.includes(child.id)) {
            newEdges.push({
              id: `${node.id}-${child.id}`,
              source: node.id,
              target: child.id,
              type: 'smoothstep', // Typ hrany
            });
          }
          traverseTopology(child);
        });
      }
    };

    topology.forEach(traverseTopology);

    // Použiť Dagre layout na výpočet pozícií
    const { nodes: layoutedNodes, edges: layoutedEdges } = getDagreLayoutedNodesAndEdges(newNodes, newEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Center the view
    setTimeout(() => fitView({ padding: 0.3 }), 100);
  };

  const handleNodesChange = (changes) => {
    const isLocked = getViewport()?.locked;
    if (isLocked) return; // Ak je zámok aktívny, ignorujeme presuny nodov
    onNodesChange(changes);
  };

  useEffect(() => {
    rebuildTopology();
  }, [topology, selectedNodes]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          color: isDarkMode ? '#fff' : '#000',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          fontFamily: 'Arial, sans-serif',
          fontSize: '0.875rem',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <strong style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
          Legend
        </strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {Object.entries(typeIcons).map(([type, Icon]) => (
            <div
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  color: typeColors[type], // Zafarbenie ikony farbou typu
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '18px',
                }}
              >
                {Icon}
              </span>
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange} // Použitie našej funkcie na kontrolu presúvania
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.1} // Minimálne oddialenie
        maxZoom={2} // Maximálne priblíženie
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default TopologyCanvas;
