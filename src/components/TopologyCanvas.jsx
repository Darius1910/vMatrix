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
import { IconButton, Paper, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
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

const TopologyCanvas = ({ topology, selectedNodes, isDarkMode = false, comparisonData = null  }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();
  const [comparisonResult, setComparisonResult] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [disableDragging, setDisableDragging] = useState(false);

  const [size, setSize] = useState({ width: 400, height: 300 });
  const [position, setPosition] = useState({ x: 1000, y: 5 });
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
          data: { label: node.label },
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

 // Porovnanie YAML topológií
 useEffect(() => {
  if (!comparisonData) return;

  const dmp = new DiffMatchPatch.diff_match_patch();
  const yaml1 = convertToYaml(topology);
  const yaml2 = convertToYaml(comparisonData);

  const diff = dmp.diff_main(yaml1, yaml2);
  dmp.diff_cleanupSemantic(diff);

  // HTML formatovanie pre <del> a <ins> s farebným zvýraznením
  let formattedDiff = diff.map(([op, text]) => {
    if (op === -1) return `<del style="background-color:#ffebe6; text-decoration:none;">${text}</del>`; // Červené pre odstránené
    if (op === 1) return `<ins style="background-color:#e6ffed; text-decoration:none;">${text}</ins>`; // Zelené pre pridané
    return text; // Nezmenené
  }).join('');

  setComparisonResult(formattedDiff);
  setShowComparison(true);
}, [comparisonData]);


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
    // Uložíme predchádzajúcu veľkosť a pozíciu pred maximalizáciou
    prevSizeRef.current = size;
    prevPositionRef.current = position;
    setSize({ width: '100%', height: '100%' });
    setPosition({ x: 0, y: 0 });
  } else {
    // Obnovíme predchádzajúcu veľkosť a pozíciu po odmaximalizovaní
    setSize(prevSizeRef.current);
    setPosition(prevPositionRef.current);
  }
  setIsFullscreen(!isFullscreen);
};

 useEffect(() => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, []);

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
          minWidth={300}
          minHeight={200}
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
            position: 'absolute', // ✅ GARANTUJEME, ŽE BUDE NAVRCHU
            zIndex: 99999, // ✅ TERAZ JE NAVRCHU VŠETKÉHO
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
            {/* ✅ Presúvať len kliknutím na horný panel */}
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
                borderBottom: isFullscreen ? '2px solid #FFF' : 'none',
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

            <div
              style={{
                padding: '10px',
                overflow: 'auto',
                height: 'calc(100% - 40px)',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
              }}
              dangerouslySetInnerHTML={{ __html: comparisonResult }}
            />
          </Paper>
        </Rnd>
      )}
    </div>
  );
};

export default TopologyCanvas;