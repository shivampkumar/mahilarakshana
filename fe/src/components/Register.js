import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { AssignmentInd as AssignmentIndIcon } from '@mui/icons-material';

function Register({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [safetyContact1, setSafetyContact1] = useState('');
  const [safetyContact2, setSafetyContact2] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    onRegister(email, password, safetyContact1, safetyContact2);
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" marginTop={8}>
        <AssignmentIndIcon color="primary" style={{ fontSize: 40, marginBottom: 20 }} />
        <Typography variant="h5" component="h1" gutterBottom>Register</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Safety Contact 1"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            value={safetyContact1}
            onChange={(e) => setSafetyContact1(e.target.value)}
          />
          <TextField
            label="Safety Contact 2"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            value={safetyContact2}
            onChange={(e) => setSafetyContact2(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" style={{ marginTop: 20 }}>
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Register;
