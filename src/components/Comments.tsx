import { Alert, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Comment } from 'db';
import { RichEditor } from './RichEditor';
import { Send } from '@mui/icons-material';
import { useState } from 'react';

type CommentsProps = {
  comments: Comment[];
  onPost?: (content: string) => void | Promise<void>;
};

export const Comments = ({ comments, onPost }: CommentsProps) => {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const onClick = async () => {
    if (content.length && onPost) {
      try {
        setPosting(true);
        await onPost(content);
        setContent('');
      } finally {
        setPosting(false);
      }
    }
  };
  return (
    <Stack gap={2}>
      <Stack direction="row" gap={1}>
        <Stack flexBasis="100%">
          <RichEditor value={content} onChange={setContent} />
        </Stack>
        <Stack alignSelf="end">
          <IconButton onClick={onClick} disabled={!content.length || posting}>
            <Send />
          </IconButton>
        </Stack>
      </Stack>

      {!comments.length && (
        <Alert variant="outlined" severity="info">
          No comments linked to this submission. Use the text box and press the{' '}
          <Send fontSize="inherit" sx={{ verticalAlign: 'middle' }} /> button to
          post a comment.
        </Alert>
      )}
      {comments.map((comment) => (
        <Paper key={comment.id} variant="outlined">
          <Stack gap={1} paddingX={4} padding={2}>
            <Typography
              dangerouslySetInnerHTML={{ __html: comment.content }}
              sx={{ paddingX: 2 }}
            />
            <Typography variant="caption" align="right">
              {comment.user?.name || 'Teacher'}{' '}
              {comment.user && `(${comment.user.username})`} -{' '}
              {new Date(comment.model.created).toLocaleString()}
            </Typography>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
