import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, List, ListItem, ListItemText, IconButton, CircularProgress, MenuItem, Select, Divider } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { getCronJobs, addCronJob, deleteCronJob, getOrgs } from '../api';
import Scrollbar from '../components/Scrollbar';

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
      setJobs(response?.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgs = async () => {
    try {
      const response = await getOrgs();
      setOrgs(Array.from(new Map(response.orgs.map(org => [org.uuid, org])).values()));
    } catch (error) {
      console.error('Error fetching organizations:', error);
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
      console.error("Error adding job:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteCronJob(jobId);
      fetchJobs(); 
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper elevation={5} sx={{ width: '500px', p: 3, borderRadius: '12px' }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
          Cron Job Manager
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Scrollbar style={{ maxHeight: '200px' }}>
            <List>
              {jobs.length === 0 ? (
                <Typography color="textSecondary" textAlign="center">No jobs available</Typography>
              ) : (
                jobs.map((job) => (
                  <ListItem key={job._id} secondaryAction={
                    <IconButton onClick={() => handleDeleteJob(job._id)} edge="end" color="error">
                      <Delete />
                    </IconButton>
                  }>
                    <ListItemText 
                      primary={job.name} 
                      secondary={job.topology?.[0]?.name || "No organization"} 
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Scrollbar>
        )}

        <Divider sx={{ my: 2 }} />

        <TextField 
          label="Job Name" 
          variant="outlined" 
          fullWidth 
          value={jobName} 
          onChange={(e) => setJobName(e.target.value)} 
          sx={{ mb: 2 }}
        />

        <Select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          displayEmpty
          fullWidth
          sx={{ mb: 2 }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: '150px',
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
          {orgs.map((org) => (
            <MenuItem key={org.uuid} value={org.name}>
              {org.name}
            </MenuItem>
          ))}
        </Select>

        <Button variant="contained" color="primary" onClick={handleAddJob} fullWidth>
          Add Job
        </Button>
      </Paper>
    </Box>
  );
};

export default CronJobManager;
