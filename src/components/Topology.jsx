import React, { useState, useEffect } from "react";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import data from "../data/data.json";
import "../styles/Dashboard.css";

const Topology = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const { nodes, edges } = processData(data);
    setNodes(nodes);
    setEdges(edges);
  }, []);

  const processData = (data) => {
    const nodes = [];
    const edges = [];

    const getNodeStyle = (type) => {
      const styles = {
        vORG: { background: "#6ac045", color: "white" },
        VDC: { background: "#339af0", color: "white" },
        vApp: { background: "#fab005", color: "black" },
        VM: { background: "#f03e3e", color: "white" },
        networks: { background: "#cc5de8", color: "white" },
      };
      return styles[type] || {};
    };

    const traverse = (item, parentId = null, x = 0, y = 0) => {
      const id = item.id || item.name;
      nodes.push({
        id,
        data: { label: item.name || id },
        position: { x: x * 200, y: y * 100 },
        style: getNodeStyle(item.type),
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${id}`,
          source: parentId,
          target: id,
        });
      }

      if (item.children) {
        item.children.forEach((child, index) =>
          traverse(child, id, x + index, y + 1)
        );
      }
    };

    traverse(data);
    return { nodes, edges };
  };

  return (
    <div className="topology-container">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default Topology;
