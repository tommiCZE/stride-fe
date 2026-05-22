import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode, MouseEvent } from 'react';
import { CloseIcon } from '../icons/icons';

export interface FilterChipProps {
  label: ReactNode;
  active?: boolean;
  count?: number;
  icon?: ReactNode;
  onClick?: () => void;
  onClear?: () => void;
  maxWidth?: number;
}

export default function FilterChip({
  label,
  active = false,
  count,
  icon,
  onClick,
  onClear,
  maxWidth,
}: FilterChipProps) {
  const handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    onClear?.();
  };

  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      sx={theme => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        height: 28,
        px: '10px',
        borderRadius: 1,
        fontSize: '14px',
        fontWeight: 500,
        cursor: onClick ? 'default' : undefined,
        userSelect: 'none',
        transition: 'background-color 0.12s, border-color 0.12s, color 0.12s',
        border: '1px solid',
        borderColor: active ? theme.palette.primary.main : theme.palette.divider,
        bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
        color: active ? 'primary.main' : 'text.secondary',
        maxWidth: maxWidth,
        whiteSpace: 'nowrap',
        '&:hover': onClick
          ? {
              bgcolor: active
                ? alpha(theme.palette.primary.main, 0.18)
                : theme.palette.action.hover,
              borderColor: active ? 'primary.main' : 'text.disabled',
            }
          : undefined,
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 1,
        },
      })}
    >
      {icon && (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          {icon}
        </Box>
      )}
      <Box
        component="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
      >
        {label}
      </Box>
      {count != null && count > 0 && (
        <Box
          component="span"
          sx={theme => ({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 18,
            height: 18,
            px: 0.5,
            borderRadius: 0.6,
            fontSize: '12px',
            fontWeight: 600,
            bgcolor: active
              ? alpha(theme.palette.primary.main, 0.20)
              : theme.palette.action.selected,
            color: active ? 'primary.main' : 'text.secondary',
          })}
        >
          {count}
        </Box>
      )}
      {onClear && active && (
        <Box
          component="span"
          role="button"
          aria-label="Vymazat filtr"
          onClick={handleClear}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ml: 0.25,
            color: 'inherit',
            opacity: 0.6,
            cursor: 'default',
            '&:hover': { opacity: 1 },
          }}
        >
          <CloseIcon/>
        </Box>
      )}
    </Box>
  );
}
