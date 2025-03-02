import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import Sidebar from '../components/Sidebar';
import TopologyCanvas from '../components/TopologyCanvas';
import { Box, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getAllTopologyByTimestamp } from '../api';
import DiffMatchPatch from 'diff-match-patch'; // Import porovnávacej knižnice

const DashboardPage = () => {
  const [topologyData, setTopologyData] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState(['org-0']);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [previousTopology, setPreviousTopology] = useState(null); // Predchádzajúca topológia

  const topologyToText = (data) => {
    if (!data || data.length === 0) return "";

    const traverse = (node, depth = 0) => {
        if (!node || !node.label) return "";

        const indent = "  ".repeat(depth);
        let text = `${indent}${node.type}: ${node.label} (ID: ${node.id || "Unknown"})`;

        // 🔹 Pridáme detaily pre VM
        if (node.type === "VM" && node.details) {
            text += `\n${indent}  RAM: ${node.details.RAM || "Unknown"} MB`;
            text += `\n${indent}  CPU: ${node.details.numCpu || "Unknown"} vCPU`;
            text += `\n${indent}  VM ID: ${node.id || "Unknown"}`;
            text += `\n${indent}  VM href: ${node.href || "Unknown"}`;
        }

        // 🔹 Pridáme detaily pre siete
        if (node.type === "Network" && node.details) {
            text += `\n${indent}  IP: ${node.details.ipAddress || "Unknown"}`;
            text += `\n${indent}  MAC: ${node.details.MAC || "Unknown"}`;
            text += `\n${indent}  Adapter: ${node.details.adapter || "Unknown"}`;
            text += `\n${indent}  Connected: ${node.details.isConnected ? "Yes" : "No"}`;
            text += `\n${indent}  Used IPs: ${node.details.usedIpCount || 0}`;
        }

        // 🔹 Pridáme detaily pre EdgeGateway
        if (node.type === "EdgeGateway" && node.details) {
            text += `\n${indent}  Firewall Rules: ${node.details.firewallRules?.length || 0}`;
            text += `\n${indent}  NAT Rules: ${node.details.natRules?.length || 0}`;
            text += `\n${indent}  Used IPs: ${node.details.usedIpCount || 0}`;
        }

        text += "\n";

        // Rekurzívne prejdeme deti
        if (node.children && node.children.length > 0) {
            text += node.children.map(child => traverse(child, depth + 1)).join("");
        }

        return text;
    };

    return data.map(org => traverse(org)).join("");
};


   
  const transformTopology = (data, timestamp) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    const firstItem = data[0];
    if (!firstItem.topology || !Array.isArray(firstItem.topology)) return [];

    const selectedTopology = firstItem.topology.find(item => item.timeStamp === timestamp);
    if (!selectedTopology || !selectedTopology.data) return [];

    return selectedTopology.data.map((org, index) => ({
        id: `org-${index}`,
        label: org.name || `vOrg-${index}`,
        type: 'vOrg',
        children: org.vdcs?.map((vdc, vdcIndex) => ({
            id: `org-${index}-vdc-${vdcIndex}`,
            label: vdc.name || `vDC-${vdcIndex}`,
            type: 'vDC',
            children: vdc.vapps?.map((vApp, vAppIndex) => ({
                id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}`,
                label: vApp.name || `vApp-${vAppIndex}`,
                type: 'vApp',
                children: vApp.details?.VirtualMachines?.map((vm, vmIndex) => ({
                    id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}`,
                    label: vm.name || `VM-${vmIndex}`,
                    type: 'VM',
                    details: vm.details, // Uchovanie detailov VM
                    children: vm.networks?.map((network, networkIndex) => ({
                        id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}-network-${networkIndex}`,
                        label: network.networkName || `Network-${networkIndex}`,
                        type: 'Network',
                        details: network, // Uchovanie detailov siete
                        children: network.networkType === "NAT_ROUTED" && network.natRoutedNetwork
                            ? [{
                                id: `org-${index}-vdc-${vdcIndex}-vApp-${vAppIndex}-vm-${vmIndex}-network-${networkIndex}-edgeGateway`,
                                label: network.natRoutedNetwork.edgeGatewayName || 'Edge Gateway',
                                type: 'EdgeGateway',
                                details: network.natRoutedNetwork, // Uchovanie detailov Edge Gateway
                            }]
                            : [],
                    })),
                })),
            })),
        })),
    }));
};

  


  const fetchData = async (uuid, timestamp, compareTimestamp = null) => {
    console.log("fetchData called with UUID:", uuid, "Timestamp:", timestamp, "Compare Timestamp:", compareTimestamp);
  
    if (!uuid || !timestamp) {
      console.warn("❌ No UUID or timestamp provided.");
      return;
    }
  
    try {
      setTopologyData([]);
      const response = await getAllTopologyByTimestamp(uuid, timestamp);
  
      console.log("API Response:", response);
  
      const data = response.data;
      if (!data || data.length === 0) {
        console.warn("❌ No data found for selected vOrg or timestamp.");
        return;
      }
  
      const transformedData = transformTopology(data, timestamp);
      console.log("✅ Načítaná topológia:", topologyToText(transformedData));
  
      // Ak máme porovnávací timestamp, načítame aj druhú topológiu na porovnanie
      if (compareTimestamp) {
        console.log("%cNačítavam porovnávací timestamp...", "color: orange;");
        const compareResponse = await getAllTopologyByTimestamp(uuid, compareTimestamp);
        const compareData = compareResponse.data;
  
        if (!compareData || compareData.length === 0) {
          console.warn("❌ No data found for comparison timestamp.");
          return;
        }
  
        const compareTransformedData = transformTopology(compareData, compareTimestamp);
        console.log("✅ Načítaná porovnávacia topológia:", topologyToText(compareTransformedData));
  
        // Vykonáme porovnanie
        console.log("%cPorovnávam s predchádzajúcim timestampom...", "color: orange;");
        compareTopologies(topologyToText(compareTransformedData), topologyToText(transformedData));
      } else {
        // Ak nemáme porovnávací timestamp, ukladáme hlavnú topológiu
        setPreviousTopology(transformedData);
      }
  
      // Uložíme hlavnú topológiu na vykreslenie
      setTopologyData(transformedData);
    } catch (error) {
      console.error("❌ Failed to fetch topology data:", error);
    }
  };
  

  const compareTopologies = (oldTopology, newTopology) => {
    if (!oldTopology || !newTopology) return;

    const dmp = new DiffMatchPatch();

    const oldLines = oldTopology.split("\n").map(line => line.trim());
    const newLines = newTopology.split("\n").map(line => line.trim());

    console.log("%c📌 Staré riadky topológie:", "color: blue; font-weight: bold;", oldLines);
    console.log("%c📌 Nové riadky topológie:", "color: green; font-weight: bold;", newLines);

    const oldMap = new Set(oldLines);
    const newMap = new Set(newLines);

    console.log("%c🔍 Porovnanie topológie:", "color: orange; font-weight: bold;");

    let changes = [];

    oldLines.forEach(line => {
        if (!newMap.has(line)) {
            console.log(`%c- ${line}`, "color: red;");
            changes.push(`❌ Zmazané: ${line}`);
        }
    });

    newLines.forEach(line => {
        if (!oldMap.has(line)) {
            console.log(`%c+ ${line}`, "color: green;");
            changes.push(`✅ Pridané: ${line}`);
        }
    });

    oldLines.forEach(line => {
        if (newMap.has(line)) {
            const oldMatch = oldLines.find(l => l.includes(line));
            const newMatch = newLines.find(l => l.includes(line));

            if (oldMatch && newMatch && oldMatch !== newMatch) {
                console.log(`%c~ ${oldMatch} → ${newMatch}`, "color: yellow;");
                changes.push(`⚠️ Zmenené: ${oldMatch} → ${newMatch}`);
            }
        }
    });

    if (changes.length > 0) {
        console.warn("⚠️ Zmeny v topológii:", changes);
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
          width: sidebarVisible ? '300px' : '0px',
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
          <TopologyCanvas topology={topologyData} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes} />
        </ReactFlowProvider>
      </Box>
    </div>
  );
};

export default DashboardPage;
