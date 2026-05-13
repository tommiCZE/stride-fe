import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloseIcon } from '../icons/icons';

interface Props {
  open: boolean;
  onClose: () => void;
}

const Kbd = styled('kbd')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 22,
  height: 22,
  padding: '0 6px',
  borderRadius: 5,
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: 11,
  fontWeight: 600,
  lineHeight: 1,
  boxShadow: theme.shadows[1],
}));

const ShortcutRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-of-type': { borderBottom: 0 },
}));

interface Shortcut {
  keys: string[][];
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: [['?']],                              description: 'Zobrazit klávesové zkratky' },
  { keys: [['Esc']],                            description: 'Zavřít dialog / task detail' },
  { keys: [['⌘', 'Enter'], ['Ctrl', 'Enter']],  description: 'Odeslat formulář' },
  { keys: [['⌘', 'K'], ['Ctrl', 'K']],          description: 'Globální vyhledávání (plánováno)' },
  { keys: [['J'], ['K']],                       description: 'Další / předchozí task (plánováno)' },
];

function KeyCombo({ combo }: { combo: string[] }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {combo.map((key, idx) => (
        <Box key={idx} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          {idx > 0 && (
            <Typography component="span" sx={{ fontSize: 11, color: 'text.disabled' }}>+</Typography>
          )}
          <Kbd>{key}</Kbd>
        </Box>
      ))}
    </Box>
  );
}

function KeyGroup({ groups }: { groups: string[][] }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
      {groups.map((combo, idx) => (
        <Box key={idx} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          {idx > 0 && (
            <Typography component="span" sx={{ fontSize: 11, color: 'text.disabled' }}>/</Typography>
          )}
          <KeyCombo combo={combo} />
        </Box>
      ))}
    </Box>
  );
}

export default function KeyboardHelpDialog({ open, onClose }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 1.5 } } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 1.5,
          fontSize: 14,
          fontWeight: 600,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ flex: 1 }}>Klávesové zkratky</Box>
        <IconButton size="small" onClick={onClose} aria-label="Zavřít">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1 }}>
        {SHORTCUTS.map((shortcut, idx) => (
          <ShortcutRow key={idx}>
            <Box sx={{ minWidth: 140 }}>
              <KeyGroup groups={shortcut.keys} />
            </Box>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
              {shortcut.description}
            </Typography>
          </ShortcutRow>
        ))}
      </DialogContent>
    </Dialog>
  );
}
