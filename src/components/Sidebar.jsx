import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  CircularProgress
} from '@mui/material';
import { ExpandLess, ExpandMore, ChevronLeft } from '@mui/icons-material';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import Scrollbar from '../components/Scrollbar';
import { useTheme } from '@mui/material/styles';
import { getOrgs, getAllTopology } from '../api'; // Assuming the same API call is used

const drawerWidth = 300;

const typeIcons = {
  vOrg: CloudOutlinedIcon,
  vDC: StorageOutlinedIcon,
  vApp: AppsOutlinedIcon,
  VM: LaptopOutlinedIcon,
  Network: NetworkCheckOutlinedIcon,
  EdgeGateway: RouterOutlinedIcon,
};

const typeColors = {
  vOrg: '#1976D2',
  vDC: '#388E3C',
  vApp: '#FBC02D',
  VM: '#D32F2F',
  Network: '#7B1FA2',
  EdgeGateway: '#455A64',
};

const Sidebar = ({ topology = [], selectedNodes = [], setSelectedNodes, sidebarVisible, setSidebarVisible, fetchData }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [allTopology, setAllTopology] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState('');
  const [topologyLoading, setTopologyLoading] = useState(false);



  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTypeFilterChange = (event) => {
    setSelectedTypes(event.target.value);
  };

  const handleCheckboxChange = (id, e) => {
    setSelectedNodes((prev = []) => {
      const newSelection = new Set(prev);
      if (e.target.checked) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return Array.from(newSelection);
    });
  };

  const collectAllNodeIds = (nodes) => {
    if (!Array.isArray(nodes)) return []; // Ochrana pred chybou
    let ids = [];
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children) {
        ids = ids.concat(collectAllNodeIds(node.children));
      }
    });
    return ids;
  };
  

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedNodes(collectAllNodeIds(topology));
    } else {
      setSelectedNodes([]);
    }
  };

  const isAllSelected = selectedNodes.length > 0 && selectedNodes.length === collectAllNodeIds(topology).length;
  const isIndeterminate = selectedNodes.length > 0 && selectedNodes.length < collectAllNodeIds(topology).length;

  const filterTopology = (nodes, searchTerm, selectedTypes) => {
    return nodes
      .map((node) => {
        if (!node || !node.label) return null; // Ochrana pred undefined label
  
        const matchLabel = node.label.toLowerCase().includes(searchTerm.toLowerCase()); 
        const matchType = selectedTypes.length === 0 || selectedTypes.includes(node.type);
        const filteredChildren = filterTopology(node.children || [], searchTerm, selectedTypes);
  
        if ((matchLabel && matchType) || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren, isHighlighted: searchTerm.length > 0 && matchLabel };
        }
        return null;
      })
      .filter(Boolean);
  };
  
  useEffect(() => {
    const fetchOrgs = async () => {
      setOrgsLoading(true);
      try {
        const response = await getOrgs();
        setOrgs(Array.from(new Map(response.orgs.map(org => [org.uuid, org])).values()));
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setOrgsLoading(false);
      }
    };
  
    fetchOrgs();
  }, []);
  
  useEffect(() => {
    const fetchAllTopology = async () => {
      if (!selectedOrg) return;
  
      const selectedOrgUUID = orgs.find(org => org.name === selectedOrg)?.uuid;
      if (!selectedOrgUUID) {
        console.error('UUID not found for selected organization');
        return;
      }
  
      // ✅ Vyčistenie všetkých starých dát
      setTopologyLoading(true);
      setAllTopology([]);
      setTimestamps([]);
      setSelectedTimestamp('');
      setSelectedNodes([]);
      fetchData(null, null); // ✅ Vyčistí aj TopologyCanvas
  
      try {
        const response = await getAllTopology(selectedOrgUUID);
        const topologyData = response?.data?.[0]?.topology || [];
  
        const timestamps = topologyData.map(item => item.timeStamp);
        setAllTopology(topologyData);
        setTimestamps(timestamps);
  
        // ✅ Ak sú prázdne dáta, vymaž topológiu
        if (timestamps.length === 0) {
          console.warn('No timestamps available for selected vOrg.');
          fetchData(null, null);
        }
      } catch (error) {
        console.error('Error fetching all topology:', error);
        fetchData(null, null); // ✅ Vyčistí aj pri chybe
      } finally {
        setTopologyLoading(false);
      }
    };
  
    fetchAllTopology();
  }, [selectedOrg, orgs]);
  
  
  const filteredTopology = filterTopology(topology, searchTerm, selectedTypes);

  useEffect(() => {
    let expandedNodes = {};
    if (searchTerm || selectedTypes.length > 0) {
      const expandNodes = (nodes) => {
        nodes.forEach((node) => {
          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            expandedNodes[node.id] = true;
            expandNodes(node.children);
          }
        });
      };
      expandNodes(filteredTopology);
    }
    setExpanded(expandedNodes);
  }, [topology]);

  const renderTree = (nodes = [], level = 0, parentColor = null) => {
    return nodes.map((node) => {
      if (!node || !node.id || !node.label) return null;
  
      const nodeId = node.id;
      const isExpanded = expanded[nodeId] || false;
      const children = node.children || [];
      const IconComponent = typeIcons[node.type] || null;
      const color = typeColors[node.type] || parentColor || theme.palette.text.primary;
      const isHighlighted = node.isHighlighted;
  
      return (
        <Box key={nodeId}>
          <ListItem
            disableGutters
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              backgroundColor: isHighlighted ? 'rgba(33, 150, 243, 0.2)' : 'inherit',
              '&:hover': { backgroundColor: isHighlighted ? 'rgba(33, 150, 243, 0.3)' : theme.palette.action.hover, borderRadius: '4px' },
              borderLeft: level > 0 ? `4px solid ${color}` : 'none',
              paddingLeft: level > 0 ? `${8 * level}px` : '8px', // Zväčšuje odsadenie podľa úrovne
            }}
          >
            <ListItemIcon sx={{ minWidth: '28px' }}>
              {IconComponent && <IconComponent sx={{ color, fontSize: 18 }} />}
            </ListItemIcon>
            <Checkbox
              checked={Boolean(selectedNodes?.includes(nodeId))}
              onChange={(e) => handleCheckboxChange(nodeId, e)}
              size="small"
            />
            <Tooltip title={node.label} arrow>
              <ListItemText
                primary={node.label}
                sx={{
                  whiteSpace: 'normal',
                  overflow: 'visible',
                  textOverflow: 'unset',
                  fontSize: '14px',
                  wordBreak: 'break-word',
                }}
              />
            </Tooltip>
            {children.length > 0 && (
              <IconButton size="small" onClick={() => toggleExpand(nodeId)} color="inherit">
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </ListItem>
  
          {children.length > 0 && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>{renderTree(children, level + 1, color)}</List>
            </Collapse>
          )}
        </Box>
      );
    });
  };
  

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarVisible}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100% - 64px)',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', }}>
        <Typography variant="h6" flex="1" fontWeight="bold" color="text.primary">
          Topology
        </Typography>
        <IconButton onClick={() => setSidebarVisible(false)} color="inherit">
          <ChevronLeft />
        </IconButton>
      </Box>
      <Divider sx={{ backgroundColor: theme.palette.divider }} />

      <Box sx={{ paddingX: 1, paddingTop:1 }}>
        <TextField fullWidth variant="outlined" size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </Box>

      <Box sx={{ paddingX: 1, }}>
      <Typography variant="caption" sx={{ color: 'gray', marginBottom: '4px' }}>
        Filter
      </Typography>
        <FormControl fullWidth size="small">
          <Select multiple value={selectedTypes} onChange={handleTypeFilterChange}>
            {Object.keys(typeIcons).map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ paddingX: 1, display: 'flex', alignItems: 'center' }}>
        <Checkbox checked={isAllSelected} indeterminate={isIndeterminate} onChange={handleSelectAllChange} />
        <Typography variant="body2">Select All</Typography>
      </Box>

      <Box sx={{ paddingX: 1 }}>
      <Select
        value={selectedOrg}
        onChange={(e) => setSelectedOrg(e.target.value)}
        displayEmpty
        fullWidth
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: '200px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#e02460',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.05)',
              },
            },
          },
        }}
      >
      <MenuItem value="" disabled>Select an organization</MenuItem>
      {orgsLoading ? (
        <MenuItem disabled>
          <Box display="flex" justifyContent="center" alignItems="center" width="100%">
            <CircularProgress size={24} />
          </Box>
        </MenuItem>
      ) : (
        orgs.map((org) => (
          <MenuItem key={org.uuid} value={org.name}>
            {org.name}
          </MenuItem>
        ))
      )}
        </Select>
      </Box>

      {timestamps.length > 0 ? (
  <Box sx={{ paddingX: 1 }}>

<Typography variant="caption" sx={{ color: 'gray', marginBottom: '4px' }}>
    Timestamp
  </Typography>
<FormControl fullWidth size="small">
  <Select
    value={selectedTimestamp}
    onChange={(e) => {
      setSelectedTimestamp(e.target.value);
      if (fetchData) {
        const selectedOrgUUID = orgs.find(org => org.name === selectedOrg)?.uuid;
        fetchData(selectedOrgUUID, e.target.value); // Fetch s UUID a timestampom
      } else {
        console.error("fetchData is not defined");
      }
    }}
    displayEmpty // ✅ Zobrazí "Select a timestamp", ak je hodnota prázdna
    fullWidth
    MenuProps={{
      PaperProps: {
        sx: {
          maxHeight: '200px',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#e02460',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
    }}
  >
    {/* ✅ Predvolená možnosť */}
    <MenuItem value="" disabled>
      Select a timestamp
    </MenuItem>

    {timestamps.map((ts) => (
      <MenuItem key={ts} value={ts}>
        {new Date(ts).toLocaleString()}
      </MenuItem>
    ))}
  </Select>
</FormControl>
  </Box>
) : (
  <Typography sx={{ padding: 1 }}>No timestamps available</Typography>
)}


<Scrollbar style={{ flexGrow: 1 }}>
  {topologyLoading ? (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
    </Box>
  ) : (
    <List>
      {renderTree(
        topology.find(item => item.timeStamp === selectedTimestamp)?.children || topology
      )}
    </List>
  )}
</Scrollbar>
    </Drawer>
  );
};

export default Sidebar;
