import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  AdminPanelSettings,
  AssignmentOutlined,
  CastForEducationOutlined,
  ClassOutlined,
  DeleteOutline,
  EditOutlined,
  GroupOutlined,
  PeopleOutline,
  PersonOutlined,
  Refresh,
  SchoolOutlined,
  SupervisorAccountOutlined,
} from '@mui/icons-material';
import { User, UserRole, Group, Activity } from 'db';
import client from 'db';
import { Button } from '@mui/material';
import {
  AdminCreateUserDialog,
  AdminManageClassDialog,
  AdminBulkAddUsersDialog,
} from 'components';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalGroups: number;
  totalActivities: number;
  totalSubmissions: number;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      flex: 1,
      minWidth: 150,
      p: 2.5,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: color,
      },
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
    >
      <Stack gap={0.5}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ fontFamily: '"Outfit", sans-serif' }}
        >
          {value}
        </Typography>
      </Stack>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}18`,
          color: color,
        }}
      >
        {icon}
      </Box>
    </Stack>
  </Paper>
);

// ─── Role Chip ────────────────────────────────────────────────────────────────

const RoleChip = ({ role }: { role: string }) => {
  const map: Record<
    string,
    {
      color: 'error' | 'primary' | 'success' | 'default';
      icon: React.ReactNode;
    }
  > = {
    Admin: {
      color: 'error',
      icon: <AdminPanelSettings sx={{ fontSize: 14 }} />,
    },
    Teacher: {
      color: 'primary',
      icon: <CastForEducationOutlined sx={{ fontSize: 14 }} />,
    },
    Student: {
      color: 'success',
      icon: <SchoolOutlined sx={{ fontSize: 14 }} />,
    },
  };
  const cfg = map[role] ?? {
    color: 'default',
    icon: <PersonOutlined sx={{ fontSize: 14 }} />,
  };
  return (
    <Chip
      size="small"
      label={role}
      color={cfg.color}
      icon={cfg.icon as any}
      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
    />
  );
};

// ─── Users Tab ───────────────────────────────────────────────────────────────

const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Student');
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isBulkAddingUsers, setIsBulkAddingUsers] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.getAllUsersAdmin(roleFilter || undefined);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEditSave = async () => {
    if (!editUser) return;
    setSavingEdit(true);
    try {
      await client.updateUserAdmin(editUser.id, {
        name: editName,
        role: editRole,
      });
      setToast(`Updated details for ${editName}`);
      setEditUser(null);
      load();
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await client.deleteUserAdmin(deleteUser.id);
      setToast(`Deleted user ${deleteUser.name}`);
      setDeleteUser(null);
      load();
    } catch {
      setToast('Failed to delete user.');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: '',
      width: 52,
      sortable: false,
      renderCell: ({ row }) => (
        <Avatar
          alt={row.name}
          src={row.avatar}
          sx={{ width: 32, height: 32 }}
        />
      ),
    },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      renderCell: ({ value }) => <RoleChip role={value} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" gap={0.5}>
          <Tooltip title="Change role">
            <IconButton
              size="small"
              onClick={() => {
                setEditUser(row as User);
                setEditName(row.name);
                setEditRole(row.role as UserRole);
              }}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete user">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteUser(row as User)}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={1}>
          {['', 'Teacher', 'Student', 'Admin'].map((r) => (
            <Chip
              key={r}
              label={r || 'All'}
              variant={roleFilter === r ? 'filled' : 'outlined'}
              color={roleFilter === r ? 'primary' : 'default'}
              onClick={() => setRoleFilter(r)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>
        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setIsBulkAddingUsers(true)}
          >
            Bulk Upload
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => setIsAddingUser(true)}
          >
            + Add User
          </Button>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={load}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' },
          }}
        />
      </Paper>

      {/* Edit User Details Dialog */}
      <Dialog
        open={!!editUser}
        onClose={() => setEditUser(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User Details</DialogTitle>
        <DialogContent>
          <Stack gap={2.5} pt={1}>
            <Typography variant="body2" color="text.secondary">
              Editing details for account ({editUser?.email})
            </Typography>

            <TextField
              label="Full Name"
              size="small"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={savingEdit}
            />

            <FormControl size="small" fullWidth>
              <Select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
              >
                {(['Student', 'Teacher', 'Admin'] as UserRole[]).map((r) => (
                  <MenuItem key={r} value={r}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <RoleChip role={r} />
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditUser(null)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={savingEdit}
            startIcon={
              savingEdit ? <CircularProgress size="1rem" /> : undefined
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete{' '}
            <strong>{deleteUser?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteUser(null)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
      />

      <AdminCreateUserDialog
        open={isAddingUser}
        onClose={() => setIsAddingUser(false)}
        onSuccess={(msg) => {
          setIsAddingUser(false);
          setToast(msg);
          load();
        }}
      />

      <AdminBulkAddUsersDialog
        open={isBulkAddingUsers}
        onClose={() => setIsBulkAddingUsers(false)}
        onSuccess={(msg) => {
          setIsBulkAddingUsers(false);
          setToast(msg);
          load();
        }}
      />
    </Stack>
  );
};

// ─── Classes Tab ─────────────────────────────────────────────────────────────

const ClassesTab = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [manageGroup, setManageGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.getAllGroupsAdmin();
      setGroups(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: GridColDef[] = [
    {
      field: 'course',
      headerName: 'Course',
      width: 110,
      valueGetter: (_, row) => (row as any)._group.course,
    },
    {
      field: 'semester',
      headerName: 'Semester',
      width: 110,
      valueGetter: (_, row) => (row as any)._group.semester,
    },
    {
      field: 'year',
      headerName: 'Year',
      width: 90,
      valueGetter: (_, row) => (row as any)._group.year,
    },
    {
      field: 'students',
      headerName: 'Students',
      width: 100,
      valueGetter: (_, row) => (row as any)._group.studentsCount,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value === -1 ? '—' : value}
          icon={<GroupOutlined sx={{ fontSize: 14 }} />}
        />
      ),
    },
    {
      field: 'teacher',
      headerName: 'Teacher',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => {
        const t = (row as any)._group.model?.expand?.teacherId;
        return t?.name || t?.email || '—';
      },
    },
    {
      field: 'teacherEmail',
      headerName: 'Teacher Email',
      flex: 1,
      minWidth: 200,
      valueGetter: (_, row) =>
        (row as any)._group.model?.expand?.teacherId?.email || '—',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: ({ row }) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => setManageGroup((row as any)._group)}
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="flex-end">
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={load}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Paper
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <DataGrid
          rows={groups.map((g) => ({ ...g.model, _group: g, id: g.id }))}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' },
          }}
        />
      </Paper>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
      />

      {manageGroup && (
        <AdminManageClassDialog
          group={manageGroup}
          open={!!manageGroup}
          onClose={() => setManageGroup(null)}
          onSuccess={(msg) => {
            setToast(msg);
            load();
          }}
        />
      )}
    </Stack>
  );
};

// ─── Activities Tab ───────────────────────────────────────────────────────────

const ActivitiesTab = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.getAllActivitiesAdmin();
      setActivities(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1.5,
      minWidth: 200,
      valueGetter: (_, row) => (row as any)._act.title,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 220,
      valueGetter: (_, row) => (row as any)._act.description,
    },
    {
      field: 'class',
      headerName: 'Class',
      width: 160,
      valueGetter: (_, row) => (row as any)._act.group?.title || '—',
    },
    {
      field: 'units',
      headerName: 'Tasks',
      width: 90,
      valueGetter: (_, row) => (row as any)._act.unitsCount,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value === -1 ? '—' : value}
          icon={<AssignmentOutlined sx={{ fontSize: 14 }} />}
        />
      ),
    },
    {
      field: 'scheduled',
      headerName: 'Scheduled',
      width: 140,
      valueGetter: (_, row) => {
        const d = (row as any)._act.scheduled;
        return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '—';
      },
    },
  ];

  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="flex-end">
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={load}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Paper
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <DataGrid
          rows={activities.map((a) => ({ ...a.model, _act: a, id: a.id }))}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' },
          }}
        />
      </Paper>
    </Stack>
  );
};

// ─── Main AdminPanel Page ─────────────────────────────────────────────────────

export const AdminPanel = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    client
      .getAdminStats()
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: 'Total Users',
          value: stats.totalUsers,
          icon: <PeopleOutline />,
          color: '#6366f1',
        },
        {
          label: 'Teachers',
          value: stats.totalTeachers,
          icon: <CastForEducationOutlined />,
          color: '#2563eb',
        },
        {
          label: 'Students',
          value: stats.totalStudents,
          icon: <SchoolOutlined />,
          color: '#059669',
        },
        {
          label: 'Classes',
          value: stats.totalGroups,
          icon: <ClassOutlined />,
          color: '#d97706',
        },
        {
          label: 'Assignments',
          value: stats.totalActivities,
          icon: <AssignmentOutlined />,
          color: '#dc2626',
        },
        {
          label: 'Submissions',
          value: stats.totalSubmissions,
          icon: <SupervisorAccountOutlined />,
          color: '#7c3aed',
        },
      ]
    : [];

  return (
    <Stack gap={4}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Stack gap={0.5}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <AdminPanelSettings fontSize="small" />
            </Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontFamily: '"Outfit", sans-serif',
                background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Admin Panel
            </Typography>
          </Stack>
          <Typography variant="subtitle2" color="text.secondary">
            Full platform visibility and management across all users, classes,
            and assignments.
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate('/dashboard')}
          sx={{ borderRadius: 2 }}
        >
          ← Back to Dashboard
        </Button>
      </Stack>

      {/* Stats row */}
      {statsLoading ? (
        <Stack direction="row" justifyContent="center" py={2}>
          <CircularProgress size="2rem" />
        </Stack>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </Stack>
      )}

      <Divider />

      {/* Tabs */}
      <Stack gap={3}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tab icon={<PeopleOutline />} iconPosition="start" label="Users" />
          <Tab icon={<ClassOutlined />} iconPosition="start" label="Classes" />
          <Tab
            icon={<AssignmentOutlined />}
            iconPosition="start"
            label="Assignments"
          />
        </Tabs>

        {tab === 0 && <UsersTab />}
        {tab === 1 && <ClassesTab />}
        {tab === 2 && <ActivitiesTab />}
      </Stack>
    </Stack>
  );
};
