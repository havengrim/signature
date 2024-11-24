import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { TextField, Button, Typography, Paper } from '@mui/material';

const Login = ({ setIsLoggedIn }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Sample credentials (You can replace this with an API call)
  const validUsername = 'admin';
  const validPassword = 'password123';

  const handleSubmit = (e: any) => {
    e.preventDefault();

    // Validate credentials
    if (username === validUsername && password === validPassword) {
      setIsLoggedIn(true); // Set the login state to true
      navigate('/signature'); // Redirect to the signature page
    } else {
      setError('Invalid credentials, please try again.');
    }
  };

  return (
    <div className="login-container">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        {error && <Typography color="error" variant="body2" align="center">{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Login;
