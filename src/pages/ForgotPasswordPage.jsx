import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Typography } from '@mui/material';
import CustomButton from '../components/CustomButton';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');

    if (!email) {
      setFieldError('Email is required');
      return;
    }

    // Logic for password reset (Send email)
  };

  return (
    <Box className="page-container">
      <Card className="card">
        <Box className="card-header" />
        <CardContent>
          <Typography variant="h5" color="primary" sx={{ textAlign: 'center', marginBottom: 2 }}>
            Reset Password
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!fieldError}
              helperText={fieldError}
            />
            <CustomButton type="submit">Send Reset Link</CustomButton>
          </form>
          <CustomButton variant="outlined" href="/" sx={{ marginTop: 2 }}>
            Back to Login
          </CustomButton>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
