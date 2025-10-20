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

  const getStudentSubmission = (studentId: string) => {
    // Find the student's submission for the selected activity
    return submissions.find((sub) => sub.student.id === studentId);
  };

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
          <Tooltip title="Refresh">
            <IconButton color="info">
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
                <Typography variant="h6" color="error" gutterBottom>
                  Class Summary Pane
                </Typography>
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
                <Typography variant="h6" color="error" gutterBottom>
                  Overview Grid View
                </Typography>

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
                            onClick={() => setSelectedStudent(student)}
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
                      sx={{ mb: 2 }}
                    />
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
                          onClick={() => {
                            // Navigate to student's submission view
                            // For now, navigate to the activity units page
                            navigate(
                              `/dashboard/activities/${selectedActivity?.id}/units`,
                            );
                          }}
                        >
                          View Work
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Recent Activity
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        • Started activity
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Working on visualization
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Last seen: 2 minutes ago
                      </Typography>
                    </Stack>
                  </Box>
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
    </>
  );
};
