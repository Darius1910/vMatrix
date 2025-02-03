import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, List, ListItem, ListItemText, 
  IconButton, CircularProgress, MenuItem 
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { getCronJobs, addCronJob, deleteCronJob, getOrgs } from '../api';
import Scrollbar from '../components/Scrollbar'; // ✅ Custom Scrollbar Component
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';

// ✅ Custom Scrollbar Styling for Autocomplete
const CustomAutocompleteList = styled('div')({
  maxHeight: '200px', 
  overflowY: 'auto',
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
});

const CronJobManager = () => {
  const [jobs, setJobs] = useState([]); 
  const [jobName, setJobName] = useState('');
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [loading, setLoading] = useState(false);
  const [orgLoading, setOrgLoading] = useState(true);

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
      console.error("Error fetching cron jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgs = async () => {
    setOrgLoading(true);
    try {
      const response = await getOrgs();
      setOrgs(response?.data || []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrgs([]);
    } finally {
      setOrgLoading(false);
    }
  };

  const handleAddJob = async () => {
    if (!jobName.trim() || !selectedOrg) return;

    const org = orgs.find(o => o.name.toLowerCase() === selectedOrg.toLowerCase());
    if (!org) return;

    try {
      await addCronJob(jobName, [{ name: org.name, uuid: org.uuid }]);
      fetchJobs(); 
      setJobName('');
      setSelectedOrg('');
    } catch (error) {
      console.error("Error adding cron job:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteCronJob(jobId);
      fetchJobs(); 
    } catch (error) {
      console.error("Error deleting cron job:", error);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper elevation={3} sx={{ display: 'flex', width: '600px', height: '400px', p: 2 }}>
        
        {/* Left Side - Job List */}
        <Box flex={1} borderRight="1px solid #ccc" pr={2} display="flex" flexDirection="column" height="100%">
          <Typography variant="h6" mb={1}>Cron Jobs</Typography>

          {/* ✅ Custom Scrollbar for Job List */}
          <Scrollbar style={{ flex: 1, minHeight: 0, height: '100%' }}> 
            {loading ? (
              <CircularProgress />
            ) : (
              <List>
                {jobs.length === 0 ? (
                  <Typography color="textSecondary">No cron jobs available</Typography>
                ) : (
                  jobs.map((job) => (
                    <ListItem key={job._id} secondaryAction={
                      <IconButton onClick={() => handleDeleteJob(job._id)} edge="end">
                        <Delete />
                      </IconButton>
                    }>
                      <ListItemText 
                        primary={job.name} 
                        secondary={job.topology?.[0]?.name || "No organization assigned"} 
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
          <Typography variant="h6" mb={1}>Control Panel</Typography>
          
          {/* Job Name Input */}
          <TextField 
            label="Job Name" 
            variant="outlined" 
            fullWidth 
            value={jobName} 
            onChange={(e) => setJobName(e.target.value)} 
            sx={{ mb: 2 }}
          />

          {/* Organization Input with Autocomplete + Custom Scrollbar */}
          {orgLoading ? (
            <CircularProgress sx={{ alignSelf: 'center', mb: 2 }} size={24} />
          ) : (
            <Autocomplete
              freeSolo
              options={orgs.map((org) => org.name) || []} // ✅ Ensuring it's always an array
              value={selectedOrg}
              onInputChange={(event, newValue) => setSelectedOrg(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select or Type Organization" variant="outlined" fullWidth />
              )}
              sx={{ mb: 2 }}
              PopperProps={{
                modifiers: [
                  {
                    name: 'preventOverflow',
                    options: {
                      boundary: 'window',
                    },
                  },
                ],
              }}
              ListboxProps={{
                component: CustomAutocompleteList, // ✅ Custom Scrollbar Applied
              }}
            />
          )}

          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddJob} 
            fullWidth
            disabled={!jobName || !selectedOrg}
          >
            Add Job
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CronJobManager;
