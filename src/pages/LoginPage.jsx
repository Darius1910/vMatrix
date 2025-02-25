import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Typography } from '@mui/material';
import CustomButton from '../components/CustomButton';
import logo from '../assets/logo.png';

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
  
    let errors = {};
  
    // 1️⃣ Check if username & password are both missing at the same time
    if (!username) errors.username = 'Username is required';
    if (!password) errors.password = 'Password is required';
  
    // If validation errors exist, show them and stop
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
  
    try {
      await login(username, password);
      navigate('/main/dash'); // Redirect on success
    } catch (err) {
      console.log("🔴 Login error received:", err.response?.data?.errors);
  
      const backendErrors = err.response?.data?.errors || {};
      setFieldErrors(backendErrors);
    }
  };
  

  

  return (
    <Box className="page-container">
      <Card className="card">
        <Box className="card-header" />
        <img src={logo} alt="Telekom Logo" style={{ width: '120px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
        <CardContent>
          <Typography variant="h5" color="primary" sx={{ textAlign: 'center',}}>
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
