import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettings,
  CastForEducationOutlined,
  SchoolOutlined,
} from '@mui/icons-material';
import { UserRole } from 'db';
import client from 'db';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AdminCreateUserDialog: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await client.createUserAdmin(name, email, password, role);
      onSuccess(`Successfully added ${role} ${name}`);
      // reset
      setName('');
      setEmail('');
      setPassword('');
      setRole('Student');
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.message || 'Failed to create user. Email may be taken.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Add New User</DialogTitle>
      <DialogContent>
        <Stack gap={2.5} pt={1}>
          {error && (
            <Typography variant="body2" color="error.main" fontWeight={500}>
              {error}
            </Typography>
          )}

          <TextField
            label="Full Name"
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Email Address"
            type="email"
            size="small"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Initial Password"
            type="password"
            size="small"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={loading}
            >
              <MenuItem value="Student">
                <Stack direction="row" gap={1} alignItems="center">
                  <SchoolOutlined sx={{ fontSize: 18 }} /> Student
                </Stack>
              </MenuItem>
              <MenuItem value="Teacher">
                <Stack direction="row" gap={1} alignItems="center">
                  <CastForEducationOutlined sx={{ fontSize: 18 }} /> Teacher
                </Stack>
              </MenuItem>
              <MenuItem value="Admin">
                <Stack direction="row" gap={1} alignItems="center">
                  <AdminPanelSettings sx={{ fontSize: 18 }} /> Admin
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size="1rem" /> : undefined}
        >
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
};
