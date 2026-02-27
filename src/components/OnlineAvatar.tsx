import { Avatar, Box, Tooltip } from '@mui/material';

type OnlineAvatarProps = {
  /** Display name — used to derive initials and background color */
  name: string;
  /** Whether this user is currently online */
  online?: boolean;
  /** Avatar size in pixels (default 36) */
  size?: number;
  /** Background color for the avatar */
  color?: string;
};

/** Consistent color from a string */
const stringToColor = (str: string) => {
  const palette = [
    '#1565c0',
    '#6a1b9a',
    '#00695c',
    '#e65100',
    '#283593',
    '#ad1457',
    '#2e7d32',
    '#004d40',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

/**
 * An Avatar that optionally shows a green "online" dot badge
 * in the bottom-right corner of the avatar circle.
 */
export const OnlineAvatar = ({
  name,
  online = false,
  size = 36,
  color,
}: OnlineAvatarProps) => {
  const dotSize = Math.max(8, Math.round(size * 0.27));
  const bgColor = color ?? stringToColor(name);
  const initial = name.charAt(0).toUpperCase();

  return (
    <Tooltip title={online ? `${name} • Online` : name} placement="right" arrow>
      <Box
        sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
      >
        <Avatar
          sx={{
            width: size,
            height: size,
            bgcolor: bgColor,
            fontSize: Math.round(size * 0.4),
            fontWeight: 700,
            letterSpacing: '-0.5px',
          }}
        >
          {initial}
        </Avatar>

        {/* Online indicator dot */}
        {online && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              bgcolor: '#22c55e', // Tailwind green-500
              border: '2px solid white',
              boxShadow: '0 0 0 1px rgba(34,197,94,0.4)',
              animation: 'presencePulse 2.4s ease-in-out infinite',
              '@keyframes presencePulse': {
                '0%, 100%': { boxShadow: '0 0 0 1px rgba(34,197,94,0.35)' },
                '50%': { boxShadow: '0 0 0 3px rgba(34,197,94,0.15)' },
              },
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
};
