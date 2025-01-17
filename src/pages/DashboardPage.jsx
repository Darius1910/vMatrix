import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopologyCanvas from '../components/TopologyCanvas';
import { useTheme } from '../context/ThemeProvider';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const { isDarkMode } = useTheme();
  const [topologyData, setTopologyData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/src/data/data.json');
        const data = await response.json();
        setTopologyData(data);
      } catch (error) {
        console.error('Failed to fetch topology data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <Sidebar />
      <div className="canvas-container">
        {topologyData ? (
          <TopologyCanvas data={topologyData} />
        ) : (
          <p>Loading topology...</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
