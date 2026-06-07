import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  CloudUploadOutlined,
  CheckCircleOutline,
  ErrorOutline,
} from '@mui/icons-material';
import { csvParse } from 'd3';
import { UserRole } from 'db';
import client from 'db';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AdminBulkAddUsersDialog: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ success: number; failed: number }>({
    success: 0,
    failed: 0,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setProgress({ current: 0, total: 0 });
    setResults({ success: 0, failed: 0 });
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    if (loading) return;
    if (results.success > 0) {
      onSuccess(`Successfully added ${results.success} users.`);
    }
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const validateRole = (role: string): UserRole => {
    const r = role.trim().toLowerCase();
    if (r === 'teacher') return 'Teacher';
    if (r === 'admin') return 'Admin';
    return 'Student'; // default
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setErrors([]);
    setResults({ success: 0, failed: 0 });

    try {
      const text = await file.text();
      const parsed = csvParse(text);

      const total = parsed.length;
      setProgress({ current: 0, total });

      let successCount = 0;
      let failCount = 0;
      const newErrors: string[] = [];

      for (let i = 0; i < total; i++) {
        const row = parsed[i];
        const name = (row.name || '').trim();
        const email = (row.email || '').trim();
        const password = (row.password || 'myPass@1234').trim();
        const role = validateRole(row.role || '');

        if (!name || !email) {
          failCount++;
          newErrors.push(`Row ${i + 1}: Missing name or email`);
        } else {
          try {
            await client.createUserAdmin(name, email, password, role);
            successCount++;
          } catch (err: any) {
            failCount++;
            newErrors.push(
              `Row ${i + 1} (${email}): ${err?.response?.message || 'Failed'}`,
            );
          }
        }
        setProgress({ current: i + 1, total });
      }

      setResults({ success: successCount, failed: failCount });
      setErrors(newErrors);
    } catch (err: any) {
      setErrors([`Error reading file: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Bulk Add Users</DialogTitle>
      <DialogContent>
        <Stack gap={3} pt={1}>
          <Typography variant="body2" color="text.secondary">
            Upload a CSV file to add multiple users at once. The file should
            have the following headers:
            <strong> name, email, password, role</strong>.
            <br />
            <br />- <strong>role</strong> can be "Student", "Teacher", or
            "Admin" (defaults to Student).
            <br />- <strong>password</strong> is optional (defaults to
            "myPass@1234" if left blank).
          </Typography>

          {!loading && progress.total === 0 && (
            <Box
              sx={{
                border: '2px dashed',
                borderColor: file ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: file ? 'primary.50' : 'background.default',
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".csv"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <CloudUploadOutlined
                sx={{
                  fontSize: 40,
                  color: file ? 'primary.main' : 'text.secondary',
                  mb: 1,
                }}
              />
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color={file ? 'primary.main' : 'text.primary'}
              >
                {file ? file.name : 'Click to select CSV file'}
              </Typography>
            </Box>
          )}

          {loading && (
            <Stack gap={1}>
              <Typography variant="body2" fontWeight={600}>
                Processing... ({progress.current} / {progress.total})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(progress.current / (progress.total || 1)) * 100}
              />
            </Stack>
          )}

          {progress.total > 0 && !loading && (
            <Stack gap={2}>
              <Stack
                direction="row"
                gap={3}
                justifyContent="center"
                p={2}
                bgcolor="background.default"
                borderRadius={2}
              >
                <Stack alignItems="center">
                  <CheckCircleOutline color="success" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" color="success.main" mt={0.5}>
                    {results.success}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Added
                  </Typography>
                </Stack>
                <Stack alignItems="center">
                  <ErrorOutline color="error" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" color="error.main" mt={0.5}>
                    {results.failed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Failed
                  </Typography>
                </Stack>
              </Stack>

              {errors.length > 0 && (
                <Box
                  sx={{
                    maxHeight: 150,
                    overflowY: 'auto',
                    p: 1.5,
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" mb={1} fontWeight={700}>
                    Error Log:
                  </Typography>
                  {errors.slice(0, 10).map((err, i) => (
                    <Typography
                      key={i}
                      variant="body2"
                      fontSize="0.75rem"
                      sx={{ wordBreak: 'break-word', opacity: 0.9 }}
                    >
                      • {err}
                    </Typography>
                  ))}
                  {errors.length > 10 && (
                    <Typography
                      variant="body2"
                      fontSize="0.75rem"
                      fontWeight={700}
                      mt={1}
                    >
                      ... and {errors.length - 10} more errors.
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!loading && progress.total === 0 && (
          <>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button variant="contained" disabled={!file} onClick={handleUpload}>
              Upload & Process
            </Button>
          </>
        )}
        {!loading && progress.total > 0 && (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
