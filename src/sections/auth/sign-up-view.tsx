import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { UserModels } from 'src/models/UserModels';
import { ResponseModels } from 'src/models/ResponseModels';
import { Link } from '@mui/material';

// ----------------------------------------------------------------------

async function RegisterUser(user: Omit<UserModels, 'userID' | 'userRole'>): Promise<boolean> {
  try {
    const backendURL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${backendURL}/api/user/post-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Username: user.username,
        UserPassword: user.userPassword,
        UserEmail: user.userEmail,
        UserAddress: user.userAddress,
        Birthday: user.birthday,
        UserRole: 'user',
      }),
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data: ResponseModels<UserModels> = await response.json();
    return !!data.data;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
}

export function SignUpView() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleSignUp = useCallback(async () => {
    if (userPassword !== confirmPassword) {
      setAlertOpen(true);
      return;
    }

    setIsLoading(true);
    const success = await RegisterUser({
      username,
      userPassword,
      userEmail,
      userAddress,
      birthday: new Date(birthday),
    });
    setIsLoading(false);

    if (success) {
      router.push('/');
    } else {
      setAlertOpen(true);
    }
  }, [username, userPassword, confirmPassword, userEmail, userAddress, birthday, router]);

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Sign up</Typography>
        <Typography variant="body2" color="text.secondary">
          Already have an account?
          <Link
            variant="subtitle2"
            sx={{ ml: 0.5, cursor: 'pointer' }}
            onClick={() => router.push('/sign-in')}
          >
            Sign in
          </Link>
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSignUp();
        }}
        display="flex"
        flexDirection="column"
        alignItems="flex-end"
      >
        <TextField
          fullWidth
          name="username"
          label="Username"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          name="email"
          label="Email"
          placeholder="you@example.com"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          name="address"
          label="Address"
          placeholder="Street, City"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          name="birthday"
          label="Birthday"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          name="password"
          label="Password"
          placeholder="********"
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <LoadingButton
          fullWidth
          size="large"
          loading={isLoading}
          type="submit"
          color="inherit"
          variant="contained"
        >
          Sign up
        </LoadingButton>
      </Box>

      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        message="Sign up failed. Please try again."
      />
    </>
  );
}
