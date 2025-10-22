import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Dashboard, Visualization, JsonEditor, DatasetTabs } from 'components';
import { useStudentSubmissions } from 'hooks';

// Mock submission status data - in real app this would come from the database
const getSubmissionStatus = (submission: any) => {
  if (!submission) return 'Not Started';
  switch (submission.state) {
    case 'draft':
      return 'In Progress';
    case 'submitted':
      return 'Completed';
    case 'help':
      return 'Help Needed';
    default:
      return 'In Progress';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Progress':
      return 'success';
    case 'Not Started':
      return 'default';
    case 'Completed':
      return 'info';
    case 'Help Needed':
      return 'error';
    case 'Stuck':
      return 'warning';
    default:
      return 'default';
  }
};

export const StudentWorkPopup = () => {
  const navigate = useNavigate();

  const {
    activity,
    student,
    submissions,
    submission: selectedSubmission,
    setSubmission: setSelectedSubmission,
    getSubmissionUnit,
    getSubmissionDatasets,
  } = useStudentSubmissions();

  const stringifySubmissionJson = (input: any): string => {
    try {
      let raw: any = input?.json ?? input;
      if (typeof raw === 'string') {
        try {
          raw = JSON.parse(raw);
        } catch {}
      }
      if (Array.isArray(raw)) {
        const first = raw[0];
        let spec: any = first?.json ?? first ?? {};
        if (typeof spec === 'string') {
          try {
            spec = JSON.parse(spec);
          } catch {}
        }
        return JSON.stringify(spec || {}, null, 4);
      }
      if (raw && typeof raw === 'object' && typeof raw.json !== 'undefined') {
        let spec: any = raw.json;
        if (typeof spec === 'string') {
          try {
            spec = JSON.parse(spec);
          } catch {}
        }
        return JSON.stringify(spec || {}, null, 4);
      }
      return JSON.stringify(raw || {}, null, 4);
    } catch {
      return '{}';
    }
  };

  const unit = useMemo(
    () => (selectedSubmission ? getSubmissionUnit(selectedSubmission) : null),
    [selectedSubmission, getSubmissionUnit],
  );

  const datasets = useMemo(
    () => (selectedSubmission ? getSubmissionDatasets(selectedSubmission) : []),
    [selectedSubmission, getSubmissionDatasets],
  );

  const json = useMemo(
    () =>
      selectedSubmission ? stringifySubmissionJson(selectedSubmission) : '{}',
    [selectedSubmission],
  );

  const handleSubmissionSelect = (submission: any) => {
    setSelectedSubmission(submission);
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  if (!activity || !student) {
    return (
      <Dialog open={true} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Student Work</DialogTitle>
        <DialogContent dividers>
          <Typography color="text.secondary">Loading...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {student?.name}'s Work - {activity?.title}
          </Typography>
          <Button
            startIcon={<Close />}
            onClick={handleClose}
            size="small"
            variant="outlined"
          >
            Close
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Submissions list */}
          <List dense>
            {submissions.map((sub) => (
              <ListItem
                key={sub.id}
                disableGutters
                secondaryAction={
                  <Chip
                    size="small"
                    label={getSubmissionStatus(sub)}
                    color={getStatusColor(getSubmissionStatus(sub)) as any}
                  />
                }
              >
                <ListItemText
                  primary={`Unit: ${getSubmissionUnit(sub)?.title || sub.unitId}`}
                  secondary={`Updated: ${new Date(sub.updated).toLocaleString()}  • Attempt: ${sub.attempt || 1}`}
                  onClick={() => handleSubmissionSelect(sub)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItem>
            ))}
          </List>

          <Divider />

          {/* Preview panels */}
          {selectedSubmission ? (
            <Stack direction="row" gap={2}>
              <Stack flex={1}>
                <Paper variant="outlined">
                  <Stack>
                    <Typography variant="subtitle1" sx={{ p: 2, pb: 1 }}>
                      Visualization
                    </Typography>
                    <Box sx={{ p: 2, pt: 0, minHeight: 240 }}>
                      <Visualization
                        key={selectedSubmission?.id}
                        datasets={datasets}
                        json={json}
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
              <Stack flex={1}>
                <Paper variant="outlined">
                  <Stack>
                    <Typography variant="subtitle1" sx={{ p: 2, pb: 1 }}>
                      Submission JSON
                    </Typography>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <JsonEditor json={json} readOnly={true} />
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Stack>
          ) : (
            <Typography color="text.secondary">
              No submission selected.
            </Typography>
          )}

          {/* Datasets */}
          {datasets?.length ? (
            <Paper variant="outlined">
              <Stack>
                <Typography variant="subtitle1" sx={{ p: 2, pb: 1 }}>
                  Datasets
                </Typography>
                <Box sx={{ p: 2, pt: 0 }}>
                  <DatasetTabs datasets={datasets} />
                </Box>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
