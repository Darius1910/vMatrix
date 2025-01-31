import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, List, ListItem, ListItemText, IconButton, CircularProgress, MenuItem, Select } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { getCronJobs, addCronJob, deleteCronJob, getOrgs } from '../api';
import Scrollbar from '../components/Scrollbar'; // Používame nový scrollbar komponent

const CronJobManager = () => {
  const [jobs, setJobs] = useState([]); 
  const [jobName, setJobName] = useState('');
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchOrgs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getCronJobs();
      if (response && Array.isArray(response.data)) { 
        setJobs(response.data);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Chyba pri načítaní jobov:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgs = async () => {
    try {
      const response = await getOrgs();
      if (response && Array.isArray(response.data)) { 
        setOrgs(response.data);
      } else {
        setOrgs([]);
      }
    } catch (error) {
      console.error("Chyba pri načítaní organizácií:", error);
      setOrgs([]);
    }
  };

  const handleAddJob = async () => {
    if (!jobName.trim() || !selectedOrg) return;

    const org = orgs.find(o => o.name === selectedOrg);
    if (!org) return;

    try {
      await addCronJob(jobName, [{ name: org.name, uuid: org.uuid }]);
      fetchJobs(); 
      setJobName('');
      setSelectedOrg('');
    } catch (error) {
      console.error("Chyba pri pridávaní jobu:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteCronJob(jobId);
      fetchJobs(); 
    } catch (error) {
      console.error("Chyba pri mazání jobu:", error);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper elevation={3} sx={{ display: 'flex', width: '600px', height: '400px', p: 2 }}>
        
        {/* Left Side - Job List */}
        <Box flex={1} borderRight="1px solid #ccc" pr={2} display="flex" flexDirection="column" height="100%">
          <Typography variant="h6" mb={1}>Cron Jobs</Typography>

          {/* Scrollbar aplikovaný na zoznam jobov */}
          <Scrollbar style={{ flex: 1, minHeight: 0, height: '100%' }}> 
            {loading ? (
              <CircularProgress />
            ) : (
              <List>
                {jobs.length === 0 ? (
                  <Typography color="textSecondary">Žiadne joby</Typography>
                ) : (
                  jobs.map((job) => (
                    <ListItem key={job._id} secondaryAction={
                      <IconButton onClick={() => handleDeleteJob(job._id)} edge="end">
                        <Delete />
                      </IconButton>
                    }>
                      <ListItemText 
                        primary={job.name} 
                        secondary={job.topology?.[0]?.name || "Žiadna organizácia"} 
                      />
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Scrollbar>
        </Box>

        {/* Right Side - Add Job Form */}
        <Box flex={1} pl={2} display="flex" flexDirection="column" justifyContent="center">
          <Typography variant="h6" mb={1}>Ovládací Panel</Typography>
          <TextField 
            label="Názov Jobu" 
            variant="outlined" 
            fullWidth 
            value={jobName} 
            onChange={(e) => setJobName(e.target.value)} 
            sx={{ mb: 1 }}
          />

          {/* ✅ Scrollbar pre Select Menu */}
          <Select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            displayEmpty
            fullWidth
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300, // Výška menu
                  overflowY: 'auto', // Povolenie scrollovania
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#e02460',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#d91b5c',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.05)',
                  },
                },
              },
            }}
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>Vyber organizáciu</MenuItem>
            {orgs.map((org) => (
              <MenuItem key={org.uuid} value={org.name}>
                {org.name}
              </MenuItem>
            ))}
          </Select>

          <Button variant="contained" color="primary" onClick={handleAddJob} fullWidth>
            Pridať Job
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CronJobManager;
