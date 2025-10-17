import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  Alert,
} from '@mui/material';
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material';
import { VisuallyHiddenInput } from './VisuallyHiddenInput';

interface ImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
  label?: string;
  maxFiles?: number;
  acceptedTypes?: string;
}

export const ImageUpload = ({
  files = [],
  onChange,
  error,
  label = 'Upload Images',
  maxFiles = 5,
  acceptedTypes = 'image/*',
}: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter(
      (file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024, // 10MB limit
    );

    if (validFiles.length !== fileArray.length) {
      alert(
        'Some files were skipped. Only image files under 10MB are allowed.',
      );
    }

    const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
    onChange(updatedFiles);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label} ({files.length}/{maxFiles})
      </Typography>

      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: dragOver
            ? 'primary.main'
            : error
              ? 'error.main'
              : 'grey.300',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          backgroundColor: dragOver ? 'action.hover' : 'transparent',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Button
          component="label"
          role={undefined}
          variant="outlined"
          tabIndex={-1}
          startIcon={<CloudUpload />}
          disabled={files.length >= maxFiles}
        >
          {files.length >= maxFiles ? 'Maximum files reached' : 'Choose Images'}
          <VisuallyHiddenInput
            type="file"
            accept={acceptedTypes}
            onChange={({ target }) => handleFileSelect(target.files)}
            multiple
          />
        </Button>

        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Drag and drop images here, or click to select
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Max {maxFiles} files, 10MB each
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Selected Images:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {files.map((file, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.50',
                }}
              >
                <ImageIcon color="action" />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText',
                    },
                  }}
                  onClick={() => handleRemoveFile(index)}
                >
                  <Delete fontSize="small" />
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 2,
                    left: 2,
                    right: 2,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.6rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};
