import React, { useEffect } from 'react';
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

const colorMap = {
  vOrg: '#2196F3',
  vDC: '#4CAF50',
  vApp: '#FFC107',
  VM: '#F44336',
  Network: '#9C27B0',
};

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

    node.position = {
      x: nodeWithPosition.x - 75,
      y: nodeWithPosition.y - 25,
    };
  });

  return { nodes, edges };
};

const TopologyCanvas = ({ topology, selectedNodes, isDarkMode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, getNodes } = useReactFlow(); // Access ReactFlow methods

  useEffect(() => {
    if (!topology) return;

    const newNodes = [];
    const newEdges = [];

    const traverse = (node) => {
      if (selectedNodes.includes(node.id)) {
        newNodes.push({
          id: node.id,
          data: { label: node.label },
          style: { backgroundColor: colorMap[node.type] },
        });
        node.children?.forEach((child) => {
          newEdges.push({ id: `${node.id}-${child.id}`, source: node.id, target: child.id });
          traverse(child);
        });
      }
    };

    topology.forEach(traverse);

    const layouted = getLayoutedNodesAndEdges(newNodes, newEdges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);

    // Fit view after ensuring nodes are rendered
    setTimeout(() => {
      const renderedNodes = getNodes();
      if (renderedNodes.length) {
        fitView({ padding: 0.3, duration: 500 }); // Smooth zoom with enough padding
      }
    }, 100); // Small delay to ensure all nodes are rendered
  }, [topology, selectedNodes, fitView, getNodes]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          color: isDarkMode ? '#fff' : '#000',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          fontFamily: 'Arial, sans-serif',
          fontSize: '0.875rem',
          zIndex: 10,
        }}
      >
        <strong
          style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: color,
                }}
              ></div>
              <span>{label}</span>
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
        <Controls /> {/* Includes Fit View button */}
      </ReactFlow>
    </div>
  );
};

export default TopologyCanvas;
