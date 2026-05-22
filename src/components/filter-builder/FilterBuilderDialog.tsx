import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import FilterBuilder from './FilterBuilder';
import { type FilterGroup, emptyGroup } from './filter-evaluator';
import { CloseIcon } from '../icons/icons';

interface FilterBuilderDialogProps {
  open: boolean;
  initialValue: FilterGroup;
  onClose: () => void;
  onApply: (group: FilterGroup) => void;
}

export default function FilterBuilderDialog({
  open,
  initialValue,
  onClose,
  onApply,
}: FilterBuilderDialogProps) {
  const [draft, setDraft] = useState<FilterGroup>(initialValue);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setDraft(initialValue);
  }

  const handleClear = () => setDraft(emptyGroup(draft.combinator));

  const handleApply = () => onApply(draft);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, flex: 1 }}>
          Pokročilý filtr
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ pt: 0.5 }}>
          <FilterBuilder value={draft} onChange={setDraft} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" onClick={handleClear}>Vyčistit</Button>
        <Box sx={{ flex: 1 }} />
        <Button size="small" onClick={onClose}>Zrušit</Button>
        <Button size="small" variant="contained" onClick={handleApply}>
          Použít
        </Button>
      </DialogActions>
    </Dialog>
  );
}
