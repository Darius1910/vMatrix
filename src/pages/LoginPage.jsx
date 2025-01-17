import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Typography } from '@mui/material';
import CustomButton from '../components/CustomButton';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' });
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setFieldErrors({ username: '', password: '' });
    setGeneralError('');

    // 1. Check if username is provided
    if (!username) {
      setFieldErrors({ username: 'Username is required', password: '' });
      return;
    }

    // 2. Check if password is provided
    if (!password) {
      setFieldErrors({ username: '', password: 'Password is required' });
      return;
    }

    try {
      await login(username, password); // Call the login function from AuthContext
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err) {
      // Handle different types of errors based on the backend response
      if (err.response?.data.message === 'Username does not exist') {
        setGeneralError('Username does not exist');
        setFieldErrors({ username: 'Username does not exist', password: '' });
      } else if (err.response?.data.message === 'Incorrect password') {
        setGeneralError('Incorrect password');
        setFieldErrors({ username: '', password: 'Incorrect password' });
      } else {
        setGeneralError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <Box className="page-container">
      <Card className="card">
        <Box className="card-header" />
        <CardContent>
          <Typography variant="h5" color="primary" sx={{ textAlign: 'center', marginBottom: 2 }}>
            vMatrix Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />
            <CustomButton type="submit">Login</CustomButton>
          </form>
          <CustomButton
            variant="outlined"
            sx={{ marginTop: 2 }}
            onClick={() => navigate('/register')}
          >
            Don’t have an account? Register here!
          </CustomButton>
          <CustomButton
            variant="outlined"
            href="/forgot-password"
            sx={{ marginTop: 2 }}
          >
            Forgot your password?
          </CustomButton>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
