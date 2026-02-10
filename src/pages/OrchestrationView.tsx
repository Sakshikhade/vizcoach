import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  Search,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Visibility,
  Assignment,
  Group,
} from '@mui/icons-material';
import { Dashboard } from 'components';
import { Visualization, JsonEditor, DatasetTabs } from 'components';
import { useDashboard } from 'hooks';
import { Activity, Group as GroupType, User } from 'db';
import client from 'db';

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

export const OrchestrationView = () => {
  const { useData } = useDashboard();
  const navigate = useNavigate();

  // Get activities and groups data from the loader
  const loaderData = useData!<{
    activities: Activity[];
    groups: GroupType[];
  }>();
  const activities = loaderData?.activities || [];
  const groups = loaderData?.groups || [];

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [activityTime, setActivityTime] = useState('00:00');
  const [isRunning, setIsRunning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [studentActivity, setStudentActivity] = useState<
    Record<string, { lastSeen: Date; status: string }>
  >({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [workDialogLoading, setWorkDialogLoading] = useState(false);
  const [workDialogError, setWorkDialogError] = useState<string | null>(null);
  const [workDialogSubmissions, setWorkDialogSubmissions] = useState<any[]>([]);
  const [selectedWork, setSelectedWork] = useState<any | null>(null);
  const [workDialogUnitTitles, setWorkDialogUnitTitles] = useState<
    Record<string, string>
  >({});
  const [workDialogUnit, setWorkDialogUnit] = useState<any | null>(null);
  const [workDialogDatasets, setWorkDialogDatasets] = useState<any[]>([]);
  const [workDialogJson, setWorkDialogJson] = useState<string>('{}');

  // Enhanced JSON processing for visualization
  const getEnhancedJson = (submission: any): string => {
    const baseJson = stringifySubmissionJson(submission);

    try {
      const parsed = JSON.parse(baseJson);

      // Add proper dimensions for the dialog visualization - same as Perform page
      const enhancedJson = {
        ...parsed,
        height: 300,
        width: 'container',
        autosize: {
          resize: true,
          type: 'fit',
        },
      };
      return JSON.stringify(enhancedJson, null, 4);
    } catch (error) {
      console.error('Error processing JSON:', error);
      return baseJson;
    }
  };

  const stringifySubmissionJson = (submission: any): string => {
    try {
      if (!submission || !submission.json) {
        return '{}';
      }

      // Use the same approach as Perform page - direct stringify
      return JSON.stringify(submission.json, null, 4);
    } catch {
      return '{}';
    }
  };

  // Load students when group is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedGroup) {
        setLoadingStudents(true);
        try {
          const students = await client.getStudents(selectedGroup.id);
          setStudents(students);
        } catch (error) {
          console.error('Error fetching students:', error);
          setStudents([]);
        } finally {
          setLoadingStudents(false);
        }
      } else {
        setStudents([]);
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedGroup]);

  // Load submissions when both activity and group are selected
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (selectedActivity && selectedGroup) {
        setLoadingSubmissions(true);
        try {
          const submissions = await client.getSubmissions(selectedActivity.id);
          console.log('Fetched submissions:', submissions);
          setSubmissions(submissions);
        } catch (error) {
          console.error('Error fetching submissions:', error);
          setSubmissions([]);
        } finally {
          setLoadingSubmissions(false);
        }
      } else {
        setSubmissions([]);
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [selectedActivity, selectedGroup]);

  // Real-time subscription for submission updates
  useEffect(() => {
    if (!selectedActivity || !selectedGroup) return;

    console.log(
      'Setting up real-time subscription for activity:',
      selectedActivity.id,
    );
    setIsRealTimeConnected(true);
    setConnectionError(null);

    // no-op activity log removed

    // Subscribe to all submission changes for this activity
    const unsubscribe = client.pb
      .collection('submissions')
      .subscribe('*', async ({ action, record }) => {
        console.log('Real-time submission update:', { action, record });

        // Only process create and update actions
        if (!['create', 'update'].includes(action)) return;

        // Check if this submission is for the selected activity
        if (record.unitId) {
          // Get the unit to check if it belongs to our activity
          try {
            const unit = await client.getUnit(
              selectedActivity.id,
              record.unitId,
            );
            if (unit) {
              console.log(
                'Submission update for our activity, refreshing submissions...',
              );
              // Refresh submissions to get the latest data
              const updatedSubmissions = await client.getSubmissions(
                selectedActivity.id,
              );
              setSubmissions(updatedSubmissions);
              setLastUpdate(new Date());

              // If work dialog is open and showing this student's work, refresh it
              if (
                workDialogOpen &&
                selectedStudent &&
                record.userId === selectedStudent.id
              ) {
                console.log(
                  'Real-time update detected for open work dialog, refreshing...',
                );
                try {
                  const subs = await client.getStudentSubmissions(
                    selectedStudent.id,
                    selectedActivity.id,
                  );
                  setWorkDialogSubmissions(subs);
                  const latest = subs[0] || null;
                  if (
                    latest &&
                    selectedWork &&
                    latest.unitId === selectedWork.unitId
                  ) {
                    const latestSubmission = await client.getSubmission(
                      selectedActivity.id,
                      latest.unitId,
                    );
                    const submissionToUse = latestSubmission || latest;
                    setWorkDialogJson(getEnhancedJson(submissionToUse));
                    setSelectedWork(submissionToUse);
                  }
                } catch (error) {
                  console.error('Error refreshing work dialog:', error);
                }
              }

              // Update student activity status
              if (record.userId) {
                const student = students.find((s) => s.id === record.userId);
                const studentName = student?.name || 'Unknown student';
                const status = record.state || 'working';

                setStudentActivity((prev) => ({
                  ...prev,
                  [record.userId]: {
                    lastSeen: new Date(),
                    status: status,
                  },
                }));

                // removed recent updates and activity log writes
              }
            }
          } catch (error) {
            console.error('Error checking unit for submission update:', error);
            setConnectionError('Failed to process real-time update');
          }
        }
      });

    // Cleanup subscription on unmount or when dependencies change
    return () => {
      console.log('Cleaning up submission subscription');
      setIsRealTimeConnected(false);
      unsubscribe
        .then((unsub) => {
          try {
            unsub();
          } catch (error) {
            console.warn('Failed to unsubscribe from submissions:', error);
          }
        })
        .catch((error) => {
          console.warn('Failed to get unsubscribe function:', error);
        });
    };
  }, [selectedActivity, selectedGroup, students]);

  // Periodic refresh of activity status
  useEffect(() => {
    if (!selectedActivity || !selectedGroup) return;

    const interval = setInterval(() => {
      // Update activity status for all students
      setStudentActivity((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((studentId) => {
          const activity = updated[studentId];
          if (activity) {
            const timeSinceLastSeen = Date.now() - activity.lastSeen.getTime();
            const minutesAgo = Math.floor(timeSinceLastSeen / (1000 * 60));

            // Mark as inactive if no activity for more than 10 minutes
            if (minutesAgo > 10) {
              updated[studentId] = {
                ...activity,
                status: 'inactive',
              };
            }
          }
        });
        return updated;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedActivity, selectedGroup]);

  // Mock timer functionality
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setActivityTime((prev) => {
        const [hours, minutes] = prev.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + 1;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const startActivity = () => {
    if (selectedActivity && selectedGroup) {
      setIsRunning(true);
      setActivityTime('00:00');
    }
  };

  const stopActivity = () => {
    setIsRunning(false);
  };

  const refreshData = async () => {
    if (!selectedActivity || !selectedGroup) return;

    setLoadingSubmissions(true);
    setConnectionError(null);
    try {
      const updatedSubmissions = await client.getSubmissions(
        selectedActivity.id,
      );
      setSubmissions(updatedSubmissions);
      setLastUpdate(new Date());
      console.log('Data refreshed manually');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setConnectionError('Failed to refresh data');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const retryConnection = () => {
    setConnectionError(null);
    setIsRealTimeConnected(false);
    // The useEffect will automatically retry the connection
  };

  // activity log cleared feature removed

  const getStudentSubmission = (studentId: string) => {
    // Find the student's submission for the selected activity
    return submissions.find((sub) => sub.student.id === studentId);
  };

  const getStudentActivityStatus = (studentId: string) => {
    const activity = studentActivity[studentId];
    if (!activity) return 'Unknown';

    const timeSinceLastSeen = Date.now() - activity.lastSeen.getTime();
    const minutesAgo = Math.floor(timeSinceLastSeen / (1000 * 60));

    if (minutesAgo < 1) return 'Active now';
    if (minutesAgo < 5) return `${minutesAgo} min ago`;
    if (minutesAgo < 60) return `${minutesAgo} min ago`;
    return 'Inactive';
  };

  // removed student-specific activity log helper

  const getStatusCounts = () => {
    const counts = { active: 0, inProgress: 0, completed: 0, help: 0 };
    students.forEach((student) => {
      const submission = getStudentSubmission(student.id);
      const status = getSubmissionStatus(submission);
      switch (status) {
        case 'In Progress':
          counts.active++;
          break;
        case 'Not Started':
          counts.inProgress++;
          break; // Treat "Not Started" as "In Progress" for display
        case 'Completed':
          counts.completed++;
          break;
        case 'Help Needed':
          counts.help++;
          break;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Show loading state if data is not available
  if (!loaderData || !activities || !groups) {
    return (
      <>
        <Dashboard.Breadcrumbs title="Orchestration View" />
        <Dashboard.Header heading="Orchestration View" subtitle="Loading..." />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <Typography>Loading orchestration data...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Dashboard.Breadcrumbs title="Orchestration View" />

      <Dashboard.Header
        heading={
          selectedActivity ? selectedActivity.title : 'Orchestration View'
        }
        subtitle={
          selectedActivity
            ? `Monitoring: ${selectedActivity.title}`
            : 'Select an activity and class to begin orchestration'
        }
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {selectedActivity && (
            <Typography
              variant="h6"
              sx={{ color: 'primary.main', fontWeight: 'bold' }}
            >
              Activity run-time: {activityTime}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <Chip
            label={isRealTimeConnected ? 'Live' : 'Offline'}
            color={isRealTimeConnected ? 'success' : 'default'}
            size="small"
            variant={isRealTimeConnected ? 'filled' : 'outlined'}
          />
          {connectionError && (
            <Tooltip title="Click to retry connection">
              <Chip
                label="Connection Error"
                color="error"
                size="small"
                variant="outlined"
                onClick={retryConnection}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          )}
          {Object.values(studentActivity).filter(
            (activity) =>
              activity && Date.now() - activity.lastSeen.getTime() < 60000,
          ).length > 0 && (
            <Chip
              label={`${
                Object.values(studentActivity).filter(
                  (activity) =>
                    activity &&
                    Date.now() - activity.lastSeen.getTime() < 60000,
                ).length
              } active`}
              color="info"
              size="small"
              variant="outlined"
            />
          )}
          {isRunning ? (
            <>
              <Tooltip title="Pause Activity">
                <IconButton onClick={() => setIsRunning(false)} color="primary">
                  <Pause />
                </IconButton>
              </Tooltip>
              <Tooltip title="Stop Activity">
                <IconButton onClick={stopActivity} color="error">
                  <Stop />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Start Activity">
              <span>
                <IconButton
                  onClick={startActivity}
                  color="primary"
                  disabled={!selectedActivity || !selectedGroup}
                >
                  <PlayArrow />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Refresh Data">
            <IconButton
              color="info"
              onClick={refreshData}
              disabled={loadingSubmissions}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Dashboard.Header>

      {/* Activity and Group Selection */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Select Activity and Class
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Activity</InputLabel>
            <Select
              value={selectedActivity?.id || ''}
              onChange={(e) => {
                const activity = activities.find(
                  (a) => a.id === e.target.value,
                );
                setSelectedActivity(activity || null);
              }}
              label="Activity"
            >
              {activities.map((activity) => (
                <MenuItem key={activity.id} value={activity.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Assignment fontSize="small" />
                    <Typography>{activity.title}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedGroup?.id || ''}
              onChange={(e) => {
                const group = groups.find((g) => g.id === e.target.value);
                setSelectedGroup(group || null);
              }}
              label="Class"
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Group fontSize="small" />
                    <Typography>{group.title}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedActivity && selectedGroup && (
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={startActivity}
              disabled={isRunning}
            >
              Start Orchestration
            </Button>
          )}
        </Stack>
      </Paper>

      {selectedActivity && selectedGroup ? (
        <Grid2 container spacing={2} sx={{ height: 'calc(100vh - 300px)' }}>
          {/* Left Section - Class Summary and Overview Grid */}
          <Grid2 xs={12} md={8}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              {/* Class Summary Pane */}
              <Paper
                variant="outlined"
                sx={{ p: 2, backgroundColor: '#f5f5f5' }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6" color="error">
                    Class Summary Pane
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={isRealTimeConnected ? 'Live' : 'Offline'}
                      color={isRealTimeConnected ? 'success' : 'default'}
                      size="small"
                      variant={isRealTimeConnected ? 'filled' : 'outlined'}
                    />
                    {connectionError && (
                      <Chip
                        label="Error"
                        color="error"
                        size="small"
                        variant="outlined"
                        onClick={retryConnection}
                        sx={{ cursor: 'pointer' }}
                      />
                    )}
                  </Stack>
                </Stack>

                {/* Activity logs removed */}
                <Grid2 container spacing={2}>
                  <Grid2 xs={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {statusCounts.active}
                      </Typography>
                      <Typography variant="body2">Active</Typography>
                    </Box>
                  </Grid2>
                  <Grid2 xs={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {statusCounts.inProgress}
                      </Typography>
                      <Typography variant="body2">In Progress</Typography>
                    </Box>
                  </Grid2>
                  <Grid2 xs={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {statusCounts.completed}
                      </Typography>
                      <Typography variant="body2">Completed</Typography>
                    </Box>
                  </Grid2>
                  <Grid2 xs={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error.main">
                        {statusCounts.help}
                      </Typography>
                      <Typography variant="body2">Help</Typography>
                    </Box>
                  </Grid2>
                </Grid2>
              </Paper>

              {/* Overview Grid View */}
              <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6" color="error">
                    Overview Grid View
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {students.length} students
                    </Typography>
                    {isRealTimeConnected && (
                      <Chip
                        label="Live Updates"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Stack>

                {/* Filter Section */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    placeholder="Filter students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Search sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    size="small"
                    sx={{ width: 300 }}
                  />
                </Box>

                {/* Student Grid */}
                {loadingStudents ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 200,
                    }}
                  >
                    <Typography>Loading students...</Typography>
                  </Box>
                ) : (
                  <Grid2 container spacing={1}>
                    {filteredStudents.map((student) => {
                      const submission = getStudentSubmission(student.id);
                      const status = getSubmissionStatus(submission);
                      return (
                        <Grid2 key={student.id} xs={6} sm={4} md={3}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border:
                                selectedStudent?.id === student.id ? 2 : 1,
                              borderColor:
                                selectedStudent?.id === student.id
                                  ? 'primary.main'
                                  : 'divider',
                              '&:hover': {
                                boxShadow: 2,
                              },
                            }}
                            onClick={() => {
                              setSelectedStudent(student);
                            }}
                          >
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                              <Avatar
                                sx={{
                                  width: 60,
                                  height: 60,
                                  mx: 'auto',
                                  mb: 1,
                                  bgcolor: 'primary.main',
                                }}
                              >
                                {student.name.charAt(0)}
                              </Avatar>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                noWrap
                              >
                                {student.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {student.email}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={status}
                                  size="small"
                                  color={getStatusColor(status) as any}
                                />
                                {getStudentActivityStatus(student.id) ===
                                  'Active now' && (
                                  <Chip
                                    label="Live"
                                    size="small"
                                    color="success"
                                    variant="filled"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid2>
                      );
                    })}
                  </Grid2>
                )}
              </Paper>
            </Stack>
          </Grid2>

          {/* Right Section - Student Details Pane */}
          <Grid2 xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                height: '100%',
                p: 2,
                backgroundColor: selectedStudent
                  ? 'background.paper'
                  : '#f5f5f5',
              }}
            >
              <Typography variant="h6" color="error" gutterBottom>
                Student Details Pane
              </Typography>

              {selectedStudent ? (
                <Stack spacing={2}>
                  <Box textAlign="center">
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {selectedStudent.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {selectedStudent.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {selectedStudent.email}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={getSubmissionStatus(
                          getStudentSubmission(selectedStudent.id),
                        )}
                        color={
                          getStatusColor(
                            getSubmissionStatus(
                              getStudentSubmission(selectedStudent.id),
                            ),
                          ) as any
                        }
                      />
                      {getStudentActivityStatus(selectedStudent.id) ===
                        'Active now' && (
                        <Chip
                          label="Live"
                          size="small"
                          color="success"
                          variant="filled"
                        />
                      )}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Progress Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activity: {selectedActivity?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Class: {selectedGroup?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status:{' '}
                      {getSubmissionStatus(
                        getStudentSubmission(selectedStudent.id),
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activity: {getStudentActivityStatus(selectedStudent.id)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Actions
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Student Work">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={async () => {
                            if (!selectedActivity || !selectedStudent) return;
                            setWorkDialogOpen(true);
                            setWorkDialogLoading(true);
                            setWorkDialogError(null);
                            setSelectedWork(null);
                            try {
                              console.log(
                                'Loading student submissions for:',
                                selectedStudent.name,
                              );
                              const subs = await client.getStudentSubmissions(
                                selectedStudent.id,
                                selectedActivity.id,
                              );
                              console.log('Loaded submissions:', subs.length);
                              setWorkDialogSubmissions(subs);
                              const latest = subs[0] || null;
                              setSelectedWork(latest);
                              const titles: Record<string, string> = {};
                              for (const s of subs) {
                                if (s.unitId && !titles[s.unitId]) {
                                  const unit = await client.getUnit(
                                    selectedActivity.id,
                                    s.unitId,
                                  );
                                  if (unit) titles[s.unitId] = unit.title;
                                }
                              }
                              setWorkDialogUnitTitles(titles);
                              if (latest) {
                                // Get the latest submission data to ensure we have recent changes
                                const latestSubmission =
                                  await client.getSubmission(
                                    selectedActivity.id,
                                    latest.unitId,
                                  );
                                console.log(
                                  'Latest submission data:',
                                  latestSubmission,
                                );

                                const unit = await client.getUnit(
                                  selectedActivity.id,
                                  latest.unitId,
                                );
                                setWorkDialogUnit(unit);
                                const datasets = unit
                                  ? await client.getDatasets(unit)
                                  : [];
                                setWorkDialogDatasets(datasets);

                                // Use the latest submission data
                                const submissionToUse =
                                  latestSubmission || latest;
                                setWorkDialogJson(
                                  getEnhancedJson(submissionToUse),
                                );
                              } else {
                                setWorkDialogUnit(null);
                                setWorkDialogDatasets([]);
                                setWorkDialogJson('{}');
                              }
                            } catch (e: any) {
                              console.error(
                                'Error loading student submissions:',
                                e,
                              );
                              setWorkDialogError('Failed to load submissions');
                              setWorkDialogSubmissions([]);
                              setWorkDialogUnit(null);
                              setWorkDialogDatasets([]);
                              setWorkDialogJson('{}');
                            } finally {
                              setWorkDialogLoading(false);
                            }
                          }}
                        >
                          View Work
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* Activity logs removed */}
                </Stack>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body1">
                    Select a student to view details
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid2>
        </Grid2>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select an Activity and Class to Begin Orchestration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose an activity from the dropdown above and select the class that
            will be participating.
          </Typography>
        </Paper>
      )}

      <Dialog
        open={workDialogOpen}
        onClose={() => setWorkDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Student Work</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={async () => {
                if (!selectedActivity || !selectedStudent) return;
                setWorkDialogLoading(true);
                try {
                  console.log('Refreshing student submissions...');
                  const subs = await client.getStudentSubmissions(
                    selectedStudent.id,
                    selectedActivity.id,
                  );
                  setWorkDialogSubmissions(subs);
                  const latest = subs[0] || null;
                  setSelectedWork(latest);

                  if (latest) {
                    const latestSubmission = await client.getSubmission(
                      selectedActivity.id,
                      latest.unitId,
                    );
                    const submissionToUse = latestSubmission || latest;
                    setWorkDialogJson(getEnhancedJson(submissionToUse));
                  }
                } catch (error) {
                  console.error('Error refreshing submissions:', error);
                } finally {
                  setWorkDialogLoading(false);
                }
              }}
              disabled={workDialogLoading}
            >
              {workDialogLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {workDialogLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : workDialogError ? (
            <Typography color="error">{workDialogError}</Typography>
          ) : (
            <Stack spacing={2}>
              <List dense>
                {workDialogSubmissions.map((sub) => (
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
                      primary={`Unit: ${workDialogUnitTitles[sub.unitId] || sub.unitId}`}
                      secondary={`Updated: ${new Date(sub.updated).toLocaleString()}  • Attempt: ${sub.attempt || 1}`}
                      onClick={async () => {
                        setSelectedWork(sub);
                        try {
                          // Get the latest submission data to ensure we have the most recent changes
                          const latestSubmission = await client.getSubmission(
                            selectedActivity!.id,
                            sub.unitId,
                          );
                          console.log(
                            'Loading latest submission data:',
                            latestSubmission,
                          );

                          const unit = await client.getUnit(
                            selectedActivity!.id,
                            sub.unitId,
                          );
                          setWorkDialogUnit(unit);
                          const datasets = unit
                            ? await client.getDatasets(unit)
                            : [];
                          setWorkDialogDatasets(datasets);

                          // Use the latest submission data instead of cached data
                          const submissionToUse = latestSubmission || sub;
                          setWorkDialogJson(getEnhancedJson(submissionToUse));
                        } catch (error) {
                          console.error(
                            'Error loading submission data:',
                            error,
                          );
                          setWorkDialogUnit(null);
                          setWorkDialogDatasets([]);
                          setWorkDialogJson('{}');
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  </ListItem>
                ))}
              </List>

              <Divider />

              {selectedWork ? (
                <Stack direction="row" gap={2}>
                  <Stack flex={1}>
                    <Paper variant="outlined">
                      <Stack>
                        <Typography variant="subtitle1" sx={{ p: 2, pb: 1 }}>
                          Visualization
                        </Typography>
                        <Box
                          sx={{
                            p: 2,
                            pt: 0,
                            minHeight: 300,
                            maxHeight: 400,
                            overflow: 'auto',
                          }}
                        >
                          {(() => {
                            console.log(
                              'OrchestrationView rendering visualization:',
                              {
                                datasetsLength: workDialogDatasets?.length || 0,
                                jsonLength: workDialogJson?.length || 0,
                                selectedWorkId: selectedWork?.id,
                                workDialogJsonPreview:
                                  workDialogJson?.substring(0, 200),
                              },
                            );
                            return workDialogDatasets?.length > 0 ? (
                              <Visualization
                                key={selectedWork?.id}
                                datasets={workDialogDatasets}
                                json={workDialogJson}
                              />
                            ) : (
                              <Typography
                                color="text.secondary"
                                sx={{ textAlign: 'center', py: 4 }}
                              >
                                No datasets available for this submission
                              </Typography>
                            );
                          })()}
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
                          <JsonEditor json={workDialogJson} readOnly={true} />
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

              {workDialogDatasets?.length ? (
                <Paper variant="outlined">
                  <Stack>
                    <Typography variant="subtitle1" sx={{ p: 2, pb: 1 }}>
                      Datasets
                    </Typography>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <DatasetTabs datasets={workDialogDatasets} />
                    </Box>
                  </Stack>
                </Paper>
              ) : null}

              {/* Student Context */}
              {selectedWork?.context && (
                <Paper variant="outlined">
                  <Stack>
                    <Typography variant="subtitle1" sx={{ p: 2, pb: 1 }}>
                      Student Context
                    </Typography>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                        >
                          {selectedWork.context}
                        </Typography>
                      </Paper>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
