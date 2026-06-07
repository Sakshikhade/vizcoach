import React, { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  DeleteOutline,
  FilePresentOutlined,
  CloudUploadOutlined,
  Close,
} from '@mui/icons-material';
import { Group, Material, User, UnsavedMaterial } from 'db';
import client from 'db';

interface Props {
  group: Group;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AdminManageClassDialog: React.FC<Props> = ({
  group,
  open,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState(0);

  // Data
  const [teachers, setTeachers] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Selection state
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [newStudentId, setNewStudentId] = useState<string>('');

  // Materials Upload State
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState('Document');
  const [matFiles, setMatFiles] = useState<File[]>([]);

  // Loading flags
  const [loading, setLoading] = useState(true);
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tList, sList, eList, mList] = await Promise.all([
        client.getAllUsersAdmin('Teacher'),
        client.getAllUsersAdmin('Student'),
        client.getStudents(group.id), // gets enrolled users via usergroups
        client.getMaterials(group.id),
      ]);
      setTeachers(tList);
      setAllStudents(sList);
      setEnrolledStudents(eList);
      setMaterials(mList);

      // Set initial teacher
      const currentTeacher = tList.find((t) => t.id === group.model?.teacherId);
      if (currentTeacher) setSelectedTeacherId(currentTeacher.id);
    } finally {
      setLoading(false);
    }
  }, [group.id, group.model?.teacherId]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  // ─── Actions ───

  const handleUpdateTeacher = async () => {
    if (!selectedTeacherId || selectedTeacherId === group.model?.teacherId)
      return;
    setSavingTeacher(true);
    try {
      await client.updateGroupTeacherAdmin(group.id, selectedTeacherId);
      onSuccess('Teacher updated successfully (refresh to see changes)');
      if (group.model) group.model.teacherId = selectedTeacherId;
    } finally {
      setSavingTeacher(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentId) return;
    setAddingStudent(true);
    try {
      const isEnrolled = enrolledStudents.some((s) => s.id === newStudentId);
      if (!isEnrolled) {
        await client.addUserToGroupAdmin(group.id, newStudentId);
        onSuccess('Student enrolled');
        const s = allStudents.find((s) => s.id === newStudentId);
        if (s) setEnrolledStudents((prev) => [...prev, s]);
      } else {
        onSuccess('Student already enrolled');
      }
      setNewStudentId('');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this student from the class?',
      )
    )
      return;
    try {
      await client.removeUserFromGroupAdmin(group.id, studentId);
      setEnrolledStudents((prev) => prev.filter((s) => s.id !== studentId));
      onSuccess('Student removed');
    } catch {
      onSuccess('Failed to remove student');
    }
  };

  const handleUploadMaterial = async () => {
    if (!matTitle || matFiles.length === 0) return;
    setUploadingMaterial(true);
    try {
      const mData: UnsavedMaterial = {
        groupId: group.id,
        title: matTitle,
        type: matType,
        file: matFiles,
      };
      const newMat = await client.addMaterial(mData);
      setMaterials((prev) => [newMat, ...prev]);
      setMatTitle('');
      setMatFiles([]);
      onSuccess('Class material uploaded');
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    if (!window.confirm('Delete this material permanently?')) return;
    try {
      await client.deleteMaterial(matId);
      setMaterials((prev) => prev.filter((m) => m.id !== matId));
      onSuccess('Material deleted');
    } catch {
      onSuccess('Failed to delete material');
    }
  };

  // ─── Renders ───

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        px={1}
        pt={1}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
          Manage Class:{' '}
          <Typography
            component="span"
            variant="h6"
            fontWeight={500}
            color="primary"
          >
            {group.course} ({group.semester} {group.year})
          </Typography>
        </DialogTitle>
        <IconButton onClick={onClose} sx={{ mr: 2 }}>
          <Close />
        </IconButton>
      </Stack>

      {loading ? (
        <Stack alignItems="center" py={5}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Access & Teacher" />
              <Tab label={`Students (${enrolledStudents.length})`} />
              <Tab label={`Materials (${materials.length})`} />
            </Tabs>
          </Box>

          <DialogContent sx={{ minHeight: 350, pt: 3 }}>
            {/* TAB 0: TEACHER */}
            {tab === 0 && (
              <Stack gap={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reassign this class to a different teacher.
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Primary Teacher</InputLabel>
                  <Select
                    label="Primary Teacher"
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      Select a teacher...
                    </MenuItem>
                    {teachers.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        <Stack direction="row" gap={1} alignItems="center">
                          <Avatar
                            src={t.avatar}
                            sx={{ width: 20, height: 20 }}
                          />
                          {t.name} ({t.email})
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  sx={{ alignSelf: 'flex-start' }}
                  disabled={
                    savingTeacher ||
                    selectedTeacherId === group.model?.teacherId
                  }
                  onClick={handleUpdateTeacher}
                >
                  {savingTeacher ? 'Saving...' : 'Update Teacher'}
                </Button>
              </Stack>
            )}

            {/* TAB 1: STUDENTS */}
            {tab === 1 && (
              <Stack gap={3}>
                <Stack direction="row" gap={1} alignItems="flex-end">
                  <FormControl fullWidth size="small">
                    <InputLabel>Add Student</InputLabel>
                    <Select
                      label="Add Student"
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value)}
                    >
                      <MenuItem value="" disabled>
                        Search or select a student...
                      </MenuItem>
                      {allStudents
                        .filter(
                          (s) => !enrolledStudents.find((es) => es.id === s.id),
                        )
                        .map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name} ({s.email})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    disabled={!newStudentId || addingStudent}
                    onClick={handleAddStudent}
                  >
                    Add
                  </Button>
                </Stack>

                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <List dense sx={{ p: 0 }}>
                    {enrolledStudents.map((s, i) => (
                      <React.Fragment key={s.id}>
                        {i > 0 && <Divider />}
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar
                              src={s.avatar}
                              sx={{ width: 28, height: 28 }}
                            />
                          </ListItemAvatar>
                          <ListItemText primary={s.name} secondary={s.email} />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              color="error"
                              onClick={() => handleRemoveStudent(s.id)}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    ))}
                    {enrolledStudents.length === 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        p={2}
                        textAlign="center"
                      >
                        No students enrolled yet.
                      </Typography>
                    )}
                  </List>
                </Box>
              </Stack>
            )}

            {/* TAB 2: MATERIALS */}
            {tab === 2 && (
              <Stack gap={3}>
                <Stack
                  spacing={2}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    Upload New Material
                  </Typography>
                  <Stack direction="row" gap={2}>
                    <TextField
                      label="Material Title"
                      size="small"
                      fullWidth
                      value={matTitle}
                      onChange={(e) => setMatTitle(e.target.value)}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        label="Type"
                        value={matType}
                        onChange={(e) => setMatType(e.target.value)}
                      >
                        {[
                          'Syllabus',
                          'Presentation',
                          'Document',
                          'Video',
                          'Other',
                        ].map((op) => (
                          <MenuItem key={op} value={op}>
                            {op}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction="row" gap={2} alignItems="center">
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadOutlined />}
                    >
                      Select File
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          e.target.files &&
                          setMatFiles(Array.from(e.target.files))
                        }
                      />
                    </Button>
                    {matFiles.length > 0 && (
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {matFiles[0].name}
                      </Typography>
                    )}
                    <Box flex={1} />
                    <Button
                      variant="contained"
                      disabled={
                        !matTitle || matFiles.length === 0 || uploadingMaterial
                      }
                      onClick={handleUploadMaterial}
                    >
                      Upload
                    </Button>
                  </Stack>
                </Stack>

                <List dense>
                  {materials.map((m, i) => (
                    <React.Fragment key={m.id}>
                      {i > 0 && <Divider />}
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.light',
                              width: 32,
                              height: 32,
                            }}
                          >
                            <FilePresentOutlined fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={m.title}
                          secondary={
                            <Stack
                              direction="row"
                              gap={1}
                              alignItems="center"
                              mt={0.5}
                            >
                              <Chip
                                size="small"
                                label={m.type}
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                              <span>{m.created.toLocaleDateString()}</span>
                              {m.file.length > 0 && (
                                <a
                                  href={client.getMaterialFileUrl(m, m.file[0])}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  View File
                                </a>
                              )}
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            color="error"
                            onClick={() => handleDeleteMaterial(m.id)}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))}
                  {materials.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      py={2}
                    >
                      No materials uploaded for this class.
                    </Typography>
                  )}
                </List>
              </Stack>
            )}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};
