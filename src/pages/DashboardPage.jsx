import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Switch, FormControlLabel } from '@mui/material';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader'; // Import the Loader component
import { useTheme } from '../context/ThemeProvider';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false); // State for showing the loader

  const handleLogout = async () => {
    setLoading(true); // Show the loader during logout
    try {
      await logout(); // Call logout function from AuthContext
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error); // Log errors for debugging
    } finally {
      setLoading(false); // Hide the loader after logout
    }
  };

  if (loading) {
    return <Loader />; // Show loader during loading
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
      }}
    >
      <Card sx={{ maxWidth: 400, padding: 4, borderRadius: 2, boxShadow: 4, position: 'relative' }}>
        <CardContent>
          <Typography variant="h5" color="primary" sx={{ textAlign: 'center', marginBottom: 2 }}>
            Welcome to Dashboard
          </Typography>
          <FormControlLabel
            control={<Switch checked={isDarkMode} onChange={toggleTheme} />}
            label="Dark Mode"
            sx={{ marginBottom: 2 }}
          />
          <CustomButton onClick={handleLogout}>Logout</CustomButton>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
