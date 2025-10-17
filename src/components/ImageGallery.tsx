import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import client from 'db';

type ImageGalleryProps = {
  record: any;
  imageNames: string[];
  title: string;
};

export const ImageGallery = ({
  record,
  imageNames,
  title,
}: ImageGalleryProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('ImageGallery rendered with:', { record, imageNames, title });

  useEffect(() => {
    const loadImages = async () => {
      if (!imageNames || imageNames.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await client.pb.files.getToken();
        const urls = imageNames.map((name) =>
          client.pb.files.getURL(record, name, { token }),
        );
        setImageUrls(urls);
        setError(null);
      } catch (err) {
        console.error('Error loading images:', err);
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [record, imageNames]);

  if (!imageNames || imageNames.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <Box
        sx={{
          marginTop: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 100,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ marginTop: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ marginTop: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        {imageUrls.map((url, index) => (
          <Box
            key={index}
            sx={{
              width: 200,
              height: 200,
              border: '2px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
                borderColor: 'primary.main',
              },
              cursor: 'pointer',
            }}
            onClick={() => window.open(url, '_blank')}
          >
            <img
              src={url}
              alt={`Reference ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.2s ease-in-out',
              }}
              onError={(e) => {
                console.error('Error loading image:', url);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              {index + 1}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
