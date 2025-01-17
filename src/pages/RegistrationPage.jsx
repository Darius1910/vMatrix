import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Typography } from '@mui/material';
import CustomButton from '../components/CustomButton';
import { registerUser } from '../api';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('must contain an uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('must contain a lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('must contain a number');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');
    setSuccessMessage('');

    const { email, username, password, confirmPassword } = formData;

    const errors = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!username) errors.username = 'Username is required';

    if (!password) {
      errors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        errors.password = `Password ${passwordErrors.join(', ')}`;
      }
    }

    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const response = await registerUser(email, username, password);
      setSuccessMessage(response.message);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <Box className="page-container">
      <Card className="card">
        <Box className="card-header" />
        <CardContent>
          <Typography variant="h5" color="primary" sx={{ textAlign: 'center', marginBottom: 2 }}>
            Register
          </Typography>
          {successMessage && (
            <Typography color="success" variant="body2" sx={{ marginBottom: '10px' }}>
              {successMessage}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              variant="outlined"
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              variant="outlined"
              margin="normal"
              value={formData.username}
              onChange={handleChange}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              variant="outlined"
              margin="normal"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
            />
            {generalError && (
              <Typography color="error" variant="body2" sx={{ marginTop: '5px', marginBottom: '5px' }}>
                {generalError}
              </Typography>
            )}
            <CustomButton type="submit">Register</CustomButton>
          </form>
          <CustomButton
            variant="outlined"
            sx={{ marginTop: 2 }}
            onClick={() => navigate('/')}
          >
            Already have an account? Login!
          </CustomButton>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegistrationPage;
