import { useEffect, useRef, useState } from 'react';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { PencilIcon } from './icons/icons';

interface Props {
  value: string;
  onSave: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  emptyLabel?: string;
}

export default function InlineEdit({
  value, onSave, placeholder, multiline, emptyLabel = '— prázdné —',
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [editing, value]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  if (editing) {
    return (
      <TextField
        inputRef={ref}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit(); }
          if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { e.preventDefault(); cancel(); }
        }}
        size="small"
        fullWidth
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Stack
      direction="row" spacing={0.75}
      onClick={() => setEditing(true)}
      sx={{
        alignItems: 'flex-start', cursor: 'pointer',
        py: 0.5, px: 0.75, ml: -0.75, borderRadius: 0.75,
        '&:hover': { bgcolor: 'action.hover' },
        '&:hover .inline-edit-pencil': { opacity: 1 },
      }}
    >
      {value ? (
        <Typography sx={{
          flex: 1, fontSize: 13, color: 'text.primary',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {value}
        </Typography>
      ) : (
        <Typography sx={{ flex: 1, fontSize: 13, color: 'text.disabled', fontStyle: 'italic' }}>
          {placeholder ?? emptyLabel}
        </Typography>
      )}
      <Box
        className="inline-edit-pencil"
        sx={{ opacity: 0, transition: 'opacity 0.15s', color: 'text.secondary', mt: 0.25 }}
      >
        <PencilIcon/>
      </Box>
    </Stack>
  );
}
