import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import CustomButton from '../components/CustomButton';
import logo from '../assets/logo.png';

const NotFoundPage = () => {
  return (
    <Box className="page-container">
      <Card className="card">
      <img src={logo} alt="Telekom Logo" style={{ width: '120px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
        <Box className="card-header" />
        <CardContent>
          <Typography variant="h5" color="primary" sx={{ textAlign: 'center', marginBottom: 3 }}>
            404 - Page Not Found
          </Typography>
          <Typography variant="body1" color="primary" sx={{ marginBottom: 3 }}>
            The page you are looking for does not exist or has been moved.
          </Typography>
          <CustomButton variant="outlined" href="/">
            Go Back to Home
          </CustomButton>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotFoundPage;
