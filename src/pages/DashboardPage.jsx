import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeProvider';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const { isDarkMode } = useTheme();
  const [filters, setFilters] = useState([
    { id: 'filter1', label: 'Filter 1', checked: false },
    { id: 'filter2', label: 'Filter 2', checked: false },
  ]);

  const [elements, setElements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/src/data/data.json');
        const data = await response.json();
        setElements(data);
      } catch (error) {
        console.error('Failed to load topology data:', error);
      }
    };
    fetchData();
  }, []);

  const toggleFilter = (id) => {
    setFilters((prevFilters) =>
      prevFilters.map((filter) =>
        filter.id === id ? { ...filter, checked: !filter.checked } : filter
      )
    );
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <Sidebar filters={filters} setFilters={toggleFilter} />
      <div className={`canvas-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <ReactFlow elements={elements} className="reactflow-canvas">
          <Background /> {/* Default ReactFlow Background */}
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DashboardPage;
