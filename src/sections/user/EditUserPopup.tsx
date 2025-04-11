import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { UserModels } from 'src/models/UserModels';

interface EditUserPopupProps {
  open: boolean;
  onClose: () => void;
  userData: UserModels | null;
  onUserUpdated: () => void;
}

type UserErrors = {
  [K in keyof UserModels]: string;
};

export default function EditUserPopup({
  open,
  onClose,
  userData,
  onUserUpdated,
}: EditUserPopupProps) {
  const [formData, setFormData] = useState<UserModels>({
    userID: '',
    username: '',
    userPassword: '',
    userRole: '',
    userEmail: '',
    userAddress: '',
    birthday: new Date(),
  });

  const [errors, setErrors] = useState<UserErrors>({
    userID: '',
    username: '',
    userPassword: '',
    userRole: '',
    userEmail: '',
    userAddress: '',
    birthday: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userData) {
      setFormData({
        ...userData,
        birthday: userData.birthday ? new Date(userData.birthday) : new Date(),
      });
      setErrors({
        userID: '',
        username: '',
        userPassword: '',
        userRole: '',
        userEmail: '',
        userAddress: '',
        birthday: '',
      });
    }
  }, [open, userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      birthday: e.target.value ? new Date(e.target.value) : new Date(),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const newErrors: UserErrors = {
      userID: '',
      username: formData.username.trim() === '' ? 'Username cannot be empty' : '',
      userPassword: formData.userPassword.trim() === '' ? 'Password cannot be empty' : '',
      userRole: formData.userRole.trim() === '' ? 'Role cannot be empty' : '',
      userEmail: formData.userEmail.trim() === '' ? 'Email cannot be empty' : '',
      userAddress: formData.userAddress.trim() === '' ? 'Address cannot be empty' : '',
      birthday:
        !formData.birthday || Number.isNaN(formData.birthday.getTime())
          ? 'Birthday cannot be empty'
          : '',
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) {
      setLoading(false);
      return;
    }

    const backendURL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${backendURL}/api/user/patch-user?userID=${formData.userID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Failed to update user.');

      onUserUpdated();
      onClose();
    } catch (error) {
      alert(`Error updating user: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.username}
            helperText={errors.username}
            sx={{ my: 2 }}
          />
          <TextField
            label="Password"
            name="userPassword"
            type="password"
            value={formData.userPassword}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.userPassword}
            helperText={errors.userPassword}
            sx={{ my: 2 }}
          />
          <TextField
            label="Role"
            name="userRole"
            select
            value={formData.userRole}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.userRole}
            helperText={errors.userRole}
            sx={{ my: 2 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="airline">Airline</MenuItem>
          </TextField>
          <TextField
            label="Email"
            name="userEmail"
            value={formData.userEmail}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.userEmail}
            helperText={errors.userEmail}
            sx={{ my: 2 }}
          />
          <TextField
            label="Address"
            name="userAddress"
            value={formData.userAddress}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.userAddress}
            helperText={errors.userAddress}
            sx={{ my: 2 }}
          />
          <TextField
            label="Birthday"
            name="birthday"
            type="date"
            value={
              formData.birthday instanceof Date ? formData.birthday.toISOString().split('T')[0] : ''
            }
            onChange={handleDateChange}
            fullWidth
            required
            error={!!errors.birthday}
            helperText={errors.birthday}
            InputLabelProps={{ shrink: true }}
            sx={{ my: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
