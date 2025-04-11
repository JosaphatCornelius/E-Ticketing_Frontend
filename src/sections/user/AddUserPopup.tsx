import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import GetSessionData from 'src/_mock/FetchSession';
import { UserModels } from 'src/models/UserModels';
import { useRouter } from 'src/routes/hooks';

interface AddUserPopupProps {
  open: boolean;
  onClose: () => void;
  onAddUser: () => void;
}

type UserErrors = {
  [K in keyof UserModels]: string;
};

const initialFormState: UserModels = {
  userID: '',
  username: '',
  userPassword: '',
  userRole: '',
  userEmail: '',
  userAddress: '',
  birthday: new Date(),
};

export default function AddUserPopup({ open, onClose, onAddUser }: AddUserPopupProps) {
  const router = useRouter();
  const [userSess, setUserSess] = useState<UserModels | null>(null);

  const [formData, setFormData] = useState<UserModels>(initialFormState);
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
    if (open) {
      setFormData(initialFormState);
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
  }, [open]);

  useEffect(() => {
    async function FetchSession() {
      const sessionUser: UserModels[] = await GetSessionData();

      if (sessionUser) {
        setUserSess(sessionUser[0]); // Set user if session exists
      } else {
        router.replace('/sign-in'); // Redirect to login page if no session
      }
    }

    FetchSession();
  }, [router]);

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

    try {
      const backendURL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${backendURL}/api/user/post-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        mode: 'cors',
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to add user');

      onAddUser();
      onClose();
    } catch (error) {
      alert(`Error adding user: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New User</DialogTitle>
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
          type="email"
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
          value={formData.birthday.toISOString().split('T')[0]}
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
          {loading ? <CircularProgress size={24} /> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
