import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import {
  CardEllipsisableBody,
  CardFooter,
  DatasetChip,
  SubmissionChip,
} from 'components';
import { Submission, Unit, toTextContent } from 'db';
import { useAuth } from 'hooks';
import client from 'db';
import { useState, useEffect } from 'react';

export interface UnitCardProps {
  unit: Unit;
  submission: Submission | null;
  locked?: boolean;
  activityId?: string;
}

export const UnitCard = ({ unit, submission, locked, activityId }: UnitCardProps) => {
  const { id, title, description, order, datasets, reference } = unit;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      if (!reference || locked) {
        setImageUrls([]);
        return;
      }

      try {
        setLoadingImages(true);
        const token = await client.pb.files.getToken();
        const referenceArray = Array.isArray(reference) ? reference : [reference];
        const urls = referenceArray.map(name => 
          client.pb.files.getURL(unit, name, { token })
        );
        setImageUrls(urls);
      } catch (err) {
        console.error('Error loading images:', err);
        setImageUrls([]);
      } finally {
        setLoadingImages(false);
      }
    };

    loadImages();
  }, [reference, unit, locked]);

  const onClick = () => {
    if (activityId) {
      navigate(`/dashboard/activities/${activityId}/units/${id}/${user?.role === 'Teacher' ? 'view' : 'perform'}`);
    } else {
      // Fallback to relative navigation if activityId is not provided
      navigate(`${id}/${user?.role === 'Teacher' ? 'view' : 'perform'}`);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{ cursor: locked ? 'not-allowed' : 'pointer' }}
    >
      <CardActionArea disabled={locked} onClick={onClick}>
        <CardContent>
          <Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography gutterBottom variant="h6">
                Unit {order} - {title}
              </Typography>
              {user?.role !== 'Teacher' && (
                <SubmissionChip submission={submission} locked={locked} />
              )}
            </Stack>
            <Stack marginY={2}>
              {!locked ? (
                <CardEllipsisableBody>
                  {toTextContent(description)}
                </CardEllipsisableBody>
              ) : (
                <Alert variant="outlined" severity="warning">
                  Complete previous units to unlock this unit.
                </Alert>
              )}
              
              {/* Reference Images Preview */}
              {!locked && reference && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Reference Images:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {loadingImages ? (
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          border: '1px solid',
                          borderColor: 'grey.300',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.50',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Loading...
                        </Typography>
                      </Box>
                    ) : (
                      imageUrls.slice(0, 3).map((url, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 50,
                            height: 50,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: 1,
                            overflow: 'hidden',
                            position: 'relative',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'scale(1.05)',
                              transition: 'all 0.2s ease-in-out',
                            },
                          }}
                        >
                          <img
                            src={url}
                            alt={`Reference ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              console.error('Error loading image:', url);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </Box>
                      ))
                    )}
                    {imageUrls.length > 3 && (
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          border: '1px solid',
                          borderColor: 'grey.300',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.100',
                          fontWeight: 'bold',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                          +{imageUrls.length - 3}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Stack>
          </Stack>
          <CardFooter locked={locked}>
            {datasets.map(
              (dataset) =>
                !locked && <DatasetChip key={dataset} dataset={dataset} />,
            )}
          </CardFooter>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
