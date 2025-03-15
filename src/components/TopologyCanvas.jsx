import React, { useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
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
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import DiffMatchPatch from 'diff-match-patch';
import { Rnd } from 'react-rnd';
import { IconButton, Paper, useTheme, Box, Typography, Divider, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DiffNavigator from './DiffNavigator';
import yaml from 'js-yaml';

const typeIcons = {
  vOrg: <CloudOutlinedIcon />,
  vDC: <StorageOutlinedIcon />,
  vApp: <AppsOutlinedIcon />,
  VM: <LaptopOutlinedIcon />,
  Network: <NetworkCheckOutlinedIcon />,
  EdgeGateway: <RouterOutlinedIcon />,
};

const typeColors = {
  vOrg: '#2196F3',
  vDC: '#4CAF50',
  vApp: '#FFC107',
  VM: '#F44336',
  Network: '#9C27B0',
  EdgeGateway: '#607D8B',
};

const getDagreLayoutedNodesAndEdges = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

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

const TopologyCanvas = ({ topology, selectedNodes, isDarkMode = false, comparisonData = null, rawTopologyData, sidebarVisible  }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();
  const [comparisonResult, setComparisonResult] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [disableDragging, setDisableDragging] = useState(false);

  const [size, setSize] = useState({ width: 800, height: 500 });
  const sidebarWidth = sidebarVisible ? 350 : 0;
  const [position, setPosition] = useState({ x: window.innerWidth - sidebarWidth - 810, y: 5 });
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const draggingRef = useRef(false);
  
  const titleBarRef = useRef(null);
  const theme = useTheme();
  const prevSizeRef = useRef(size);
  const prevPositionRef = useRef(position);


  const rebuildTopology = () => {
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
          data: { 
            label: node.label,
            details: node.details || {},  
          }, 
          style: { backgroundColor: typeColors[node.type] || '#cccccc' },
          position: { x: 0, y: 0 },
        });
        
  
        node.children?.forEach((child) => {
          if (selectedNodes.includes(child.id)) {
            newEdges.push({
              id: `${node.id}-${child.id}`,
              source: node.id,
              target: child.id,
              type: 'smoothstep',
            });
          }
          traverseTopology(child);
        });
      }
    };
  
    topology.forEach(traverseTopology);
  
    const { nodes: layoutedNodes, edges: layoutedEdges } = getDagreLayoutedNodesAndEdges(newNodes, newEdges);
  
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  
    setTimeout(() => fitView({ padding: 0.3 }), 100);
  };
  

  useEffect(() => {
    rebuildTopology();
  }, [topology, selectedNodes]);

 // Konvertuje topológiu do YAML
 const convertToYaml = (data) => yaml.dump(data, { indent: 2 });

 useEffect(() => {
  console.log("📊 comparisonData updated:", comparisonData);
  console.log("📊 rawTopologyData (base data):", rawTopologyData);
  
  if (!comparisonData || !rawTopologyData) return;

  const dmp = new DiffMatchPatch.diff_match_patch();
  const yaml1 = convertToYaml(rawTopologyData);
  const yaml2 = convertToYaml(comparisonData);

  const diff = dmp.diff_main(yaml1, yaml2);
  dmp.diff_cleanupSemantic(diff);

  // Detect if Dark Mode is enabled
  const isDarkMode = theme.palette.mode === 'dark';

  let formattedDiff = diff.map(([op, text]) => {
    if (op === -1) return `<del style="background-color:${isDarkMode ? '#6e0b0b' : '#ffebe6'}; color: ${isDarkMode ? '#ff8383' : '#b00020'}; text-decoration: none;">${text}</del>`;
    if (op === 1) return `<ins style="background-color:${isDarkMode ? '#093d09' : '#e6ffed'}; color: ${isDarkMode ? '#92ff92' : '#007500'}; text-decoration: none;">${text}</ins>`;
    return text;
  }).join('');

  setComparisonResult(formattedDiff);
  setShowComparison(true);
}, [comparisonData, rawTopologyData, theme]);

  const handleMouseUp = () => {
    setDisableDragging(false);
  };
 // Funkcia na presun
 const handleMouseMove = (e) => {
   if (!draggingRef.current) return;
   setPosition({ x: e.clientX - draggingRef.current.startX, y: e.clientY - draggingRef.current.startY });
 };

 const toggleFullscreen = () => {
  if (!isFullscreen) {
    prevSizeRef.current = size;
    prevPositionRef.current = position;
    setSize({ width: '100%', height: '100%' });
    setPosition({ x: 0, y: 0 });
  } else {
    setSize(prevSizeRef.current);
    setPosition(prevPositionRef.current);
  }
  setIsFullscreen(!isFullscreen);
};

const handleNodeClick = (event, node) => {
  console.log("🔍 Clicked Node:", node);

  // Extract URN from the node ID field (format: urn:vcloud:vm:<id>)
  const urnMatch = node.id.match(/urn:vcloud:vm:([a-z0-9\-]+)/);
  const urn = urnMatch ? urnMatch[0] : "N/A";

  // Log the URN to confirm
  console.log("🔍 Extracted URN:", urn);

  let nodeType = node.type || node.data.type || "Unknown";

  // Fix specific node types based on ID
  if (node.id.includes("network")) {
    nodeType = "Network";
  } 
  if (node.id.includes("edge")) {
    nodeType = "EdgeGateway";
  }
  if (node.id.includes("vm")) {
    nodeType = "VM";
  } 
  if (node.id.includes("vapp")) {
    nodeType = "vApp";
  } 
  if (node.id.includes("vdc")) {
    nodeType = "vDC";
  } 
  if (node.id.includes("org")) {
    nodeType = "vOrg";
  }

  // Set selected node info, including the extracted URN
  setSelectedNodeInfo({
    id: node.id,
    label: node.data.label,
    type: nodeType,
    details: node.data.details || {},
    urn: urn,  
  });

  setIsPanelVisible(true);
};

const closePanel = () => {
  setIsPanelVisible(false); 
};

 useEffect(() => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, []);

useEffect(() => {
  if (!isFullscreen) {
    setPosition({ x: window.innerWidth - (sidebarVisible ? 350 : 0) - 810, y: 5 });
  }
}, [sidebarVisible, isFullscreen]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          color: '#000',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          fontFamily: 'Arial, sans-serif',
          fontSize: '0.875rem',
          textAlign: 'center',
          zIndex: theme.zIndex.appBar, 
        }}
      >
        <strong style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>Legend</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {Object.entries(typeIcons).map(([type, Icon]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: typeColors[type], display: 'flex', alignItems: 'center', fontSize: '18px' }}>
                {Icon}
              </span>
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick} 
        fitView
        minZoom={0.1}
        maxZoom={2}
        style={{ zIndex: theme.zIndex.drawer }}
      >
        <Background />
        <Controls />
      </ReactFlow>

    {/* ✅ Minimalizovacia záložka - presunutá do pravého dolného rohu */}
    {isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          style={{
            position: 'fixed',
            bottom: 15,
            right: 15, // ✅ Uistíme sa, že záložka je vždy viditeľná
            padding: '10px 15px',
            backgroundColor: '#e20074',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            zIndex: theme.zIndex.modal + 10, // ✅ Záložka je vždy navrchu
          }}
        >
          📌 Topology Comparison
        </div>
      )}

      {/* ✅ Opravené porovnávacie okno s NAJvyšším z-indexom */}
      {showComparison && !isMinimized && (
        <Rnd
          size={size}
          position={position}
          minWidth={700}
          minHeight={500}
          bounds="window"
          enableResizing={!isFullscreen}
          dragHandleClassName="drag-handle"
          onResizeStop={(e, direction, ref, delta, position) => {
            setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
            setPosition(position);
          }}
          onDragStop={(e, d) => {
            setPosition({ x: d.x, y: d.y });
          }}
          style={{
            position: 'absolute',
            zIndex: 99999,
          }}
        >
          <Paper
            elevation={5}
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              transition: 'all 0.3s ease-in-out',
              borderTop: isFullscreen ? '1px solid #FFF' : 'none',
              boxShadow: isFullscreen ? '0px 0px 10px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {/* ✅ Horný panel na presúvanie */}
            <div
              ref={titleBarRef}
              className="drag-handle"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#e20074',
                color: 'white',
                padding: '5px 10px',
                cursor: 'move',
              }}
            >
              <span>Topology Comparison</span>
              <div>
                <IconButton onClick={() => setIsMinimized(true)} size="small" sx={{ color: 'white' }}>
                  <MinimizeIcon />
                </IconButton>
                <IconButton onClick={toggleFullscreen} size="small" sx={{ color: 'white' }}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
                <IconButton onClick={() => setShowComparison(false)} size="small" sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </div>
            </div>

            {/* ✅ Hlavný obsah - Diff + Navigátor */}
            <div style={{ display: 'flex', height: 'calc(100% - 40px)' }}>
              {/* 🔹 Porovnávací text (Diff) */}
              <div
              className="comparison-container"
              style={{
                flex: 1,
                padding: '10px',
                overflow: 'auto',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '100%', 
              }}
              dangerouslySetInnerHTML={{ __html: comparisonResult }}
            />
              
              {/* 🔹 Navigátor zmien */}
              <div
                style={{
                  width: '300px',
                }}
              >
                <DiffNavigator comparisonResult={comparisonResult} />
              </div>
            </div>
          </Paper>
        </Rnd>
      )}


{isPanelVisible && selectedNodeInfo && (
  <Paper
    elevation={5}
    sx={{
      position: 'absolute',
      top: 20,
      right: 20,
      width: 320,
      padding: '10px',
      borderRadius: '8px',
      backgroundColor: theme.palette.background.paper,
      boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
      maxHeight: '80vh',
    }}
  >
    {/* Name */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',  }}>
      <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
        {selectedNodeInfo.label}
      </Typography>
      <IconButton onClick={closePanel} size="small">
              <CloseIcon />
      </IconButton>
    </Box>
    
    <Divider sx={{ my: 1 }} />

    {/* Node Type */}
    <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
      Type: <span style={{ color: typeColors[selectedNodeInfo.type] || '#000' }}>
        {selectedNodeInfo.type || "Unknown"}
      </span>
    </Typography>

    <Box sx={{ overflowY: 'auto', maxHeight: '70vh', }}>
 {/* UUID / URN */}
 {selectedNodeInfo.type === 'vOrg' && (
      <>
        <Typography variant="body2">UUID: {selectedNodeInfo.details.uuid || "N/A"}</Typography>
      </>
    )}

    {selectedNodeInfo.type === 'VM' && (
      <>
        <Typography variant="body2">URN: {selectedNodeInfo.urn || "N/A"}</Typography>
      </>
    )}

    <Divider sx={{ my: 1 }} />

    {/* Sub-object Counts (vApps, vDCs, VMs, etc.) */}
    {selectedNodeInfo.type === 'vOrg' && (
      <>
        <Typography variant="body2">Number of vDCs: {selectedNodeInfo.details.vdcsCount || 0}</Typography>
        <Typography variant="body2">Number of vApps: {selectedNodeInfo.details.vAppsCount || 0}</Typography>
        <Typography variant="body2">Number of VMs: {selectedNodeInfo.details.vmCount || 0}</Typography>
      </>
    )}

    {selectedNodeInfo.type === 'vDC' && (
      <>
        <Typography variant="body2">Number of vApps: {selectedNodeInfo.details.vAppsCount || 0}</Typography>
        <Typography variant="body2">Number of VMs: {selectedNodeInfo.details.vmCount || 0}</Typography>
      </>
    )}

    {selectedNodeInfo.type === 'vApp' && (
      <>
        <Typography variant="body2">Number of VMs: {selectedNodeInfo.details.vmCount || 0}</Typography>
      </>
    )}

{selectedNodeInfo.type === 'VM' && (
    <>
      <Typography variant="body2">CPU: {selectedNodeInfo.details.cpu || 0}</Typography>
      <Typography variant="body2">RAM: {selectedNodeInfo.details.ram || 0} MB</Typography>

      <Divider sx={{ my: 1 }} />

      {/* Network(s) Accordion */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Network(s): {selectedNodeInfo.details.networks?.length || 0}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {selectedNodeInfo.details.networks?.map((network, index) => (
            <Box key={index} sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: '4px' }}>
              <Typography variant="body2">Network: {network.networkName || "N/A"}</Typography>
              <Typography variant="body2">IP Address: {network.ipAddress || "N/A"}</Typography>
              <Typography variant="body2">MAC Address: {network.MAC || network.directNetwork?.MAC || network.natRoutedNetwork?.MAC || "N/A"}</Typography>
              <Typography variant="body2">Adapter: {network.adapter || "N/A"}</Typography>
              <Typography variant="body2">Connected: {network.isConnected !== undefined ? (network.isConnected ? "Yes" : "No") : "N/A"}</Typography>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </>
  )}

{selectedNodeInfo.type === 'Network' && (
  <>
    {/* General Network Information */}
    <Typography variant="body2"><strong>IP Address:</strong> {selectedNodeInfo.details.ipAddress || "N/A"}</Typography>
    <Typography variant="body2"><strong>MAC Address:</strong> {selectedNodeInfo.details.mac || "N/A"}</Typography>
    <Typography variant="body2"><strong>Used IP Count:</strong> {selectedNodeInfo.details.usedIpCount || 0}</Typography>
    <Typography variant="body2"><strong>Adapter:</strong> {selectedNodeInfo.details.adapter || "N/A"}</Typography>
    <Typography variant="body2"><strong>Connected:</strong> {selectedNodeInfo.details.isConnected ? "Yes" : "No"}</Typography>
  </>
)}

{selectedNodeInfo.type === 'EdgeGateway' && (
    <>
      {/* Firewall Rules Accordion */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="firewall-rules-content"
          id="firewall-rules-header"
        >
          <Typography>Firewall Rules: {selectedNodeInfo.details.firewallRules?.length || 0}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {selectedNodeInfo.details.firewallRules?.map((rule, index) => (
            <Box key={index} sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: '4px' }}>
              <Typography variant="body2">Rule: {rule.name}</Typography>
              <Typography variant="body2">Action: {rule.actionValue || "N/A"}</Typography>
              <Typography variant="body2">Protocol: {rule.ipProtocol || "N/A"}</Typography>
              <Typography variant="body2">Direction: {rule.direction || "N/A"}</Typography>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* SNAT Rules Accordion */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="snat-rules-content"
          id="snat-rules-header"
        >
          <Typography>SNAT Rules: {selectedNodeInfo.details.natRules?.filter(rule => rule.type === "SNAT").length || 0}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {selectedNodeInfo.details.natRules?.filter(rule => rule.type === "SNAT").map((rule, index) => (
            <Box key={index} sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: '4px' }}>
              <Typography variant="body2">SNAT Rule: {rule.name}</Typography>
              <Typography variant="body2">Description: {rule.description || "N/A"}</Typography>
              <Typography variant="body2">External IP: {rule.externalAddresses || "N/A"}</Typography>
              <Typography variant="body2">Internal IP: {rule.internalAddresses || "N/A"}</Typography>
              <Typography variant="body2">Priority: {rule.priority || "N/A"}</Typography>
              <Typography variant="body2">SNAT Destination Addresses: {rule.snatDestinationAddresses || "N/A"}</Typography>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* DNAT Rules Accordion */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="dnat-rules-content"
          id="dnat-rules-header"
        >
          <Typography>DNAT Rules: {selectedNodeInfo.details.natRules?.filter(rule => rule.type === "DNAT").length || 0}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {selectedNodeInfo.details.natRules?.filter(rule => rule.type === "DNAT").map((rule, index) => (
            <Box key={index} sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: '4px' }}>
              <Typography variant="body2">DNAT Rule: {rule.name}</Typography>
              <Typography variant="body2">Description: {rule.description || "N/A"}</Typography>
              <Typography variant="body2">External IP: {rule.externalAddresses || "N/A"}</Typography>
              <Typography variant="body2">Internal IP: {rule.internalAddresses || "N/A"}</Typography>
              <Typography variant="body2">Priority: {rule.priority || "N/A"}</Typography>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </>
  )}
    </Box>
  </Paper>
)}
    </div>
  );
};

export default TopologyCanvas;