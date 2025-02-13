import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// Automatické rozloženie uzlov pomocou Dagre
const getDagreLayoutedNodesAndEdges = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = dagreGraph.node(node.id);
      return {
        ...node,
        position: { x, y },
        targetPosition: 'top',
        sourcePosition: 'bottom',
      };
    }),
    edges,
  };
};

// Custom Node component
const CustomNode = ({ data }) => {
  return (
    <div
      style={{
        color: 'black',
      }}
    >
      <Handle type="target" position="top" style={{ background: 'black', width: '8px', height: '8px' }} />
      {data.label}
      <Handle type="source" position="bottom" style={{ background: 'black', width: '8px', height: '8px' }} />
    </div>
  );
};

const CustomModeCanvas = ({ newNodes }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (newNodes.length > 0) {
      const { nodes: layoutedNodes } = getDagreLayoutedNodesAndEdges([...nodes, ...newNodes], edges);
      setNodes(layoutedNodes);

      // Po malom oneskorení (100 ms) sa automaticky nastaví fitView
      setTimeout(() => fitView({ padding: 0.3 }), 100);
    }
  }, [newNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={{ default: CustomNode }}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default CustomModeCanvas;
