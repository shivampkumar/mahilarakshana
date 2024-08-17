import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { LockOpen as LockOpenIcon, Email as EmailIcon } from '@mui/icons-material';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    onLogin(email, password);
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" marginTop={8}>
        <LockOpenIcon color="primary" style={{ fontSize: 40, marginBottom: 20 }} />
        <Typography variant="h5" component="h1" gutterBottom>Login</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: <EmailIcon position="start" />,
            }}
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
          <Button type="submit" fullWidth variant="contained" color="primary" style={{ marginTop: 20 }}>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Login;
