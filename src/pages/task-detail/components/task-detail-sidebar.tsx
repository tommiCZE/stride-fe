import { Box, Divider, Typography } from '@mui/material';
import { SectionLabel } from '../../../components/ui/ui';
import FluxAvatar from '../../../components/flux-avatar';
import { FieldRow } from '../fields/field-helpers';
import {
  AssigneeEditor, PriorityEditor, TypeEditor, EpicEditor,
  SprintEditor, LabelsEditor, EstimateEditor, DueDateEditor, LoggedBar,
  type PatchFn,
} from '../fields/field-editors';
import type { TaskDto } from '../../../api/types';

interface Props {
  task: TaskDto;
  onPatch: PatchFn;
}

export default function TaskDetailSidebar({ task, onPatch }: Props) {
  return (
    <Box sx={{ borderLeft: { xs: 0, md: 1 }, borderTop: { xs: 1, md: 0 }, borderColor: 'divider',
      bgcolor: 'background.paper', overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <SectionLabel>Detaily</SectionLabel>
      <FieldRow label="Assignee">
        <AssigneeEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Reporter">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12.5 }}>
          <FluxAvatar user={task.reporter} size={20}/> {task.reporter?.name}
        </Box>
      </FieldRow>
      <FieldRow label="Priorita">
        <PriorityEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Typ">
        <TypeEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Epic">
        <EpicEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Sprint">
        <SprintEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Štítky">
        <LabelsEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Estimate">
        <EstimateEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Logged">
        <LoggedBar logged={task.logged} estimate={task.estimate}/>
      </FieldRow>
      <FieldRow label="Due">
        <DueDateEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      {task.createdAt && (
        <>
          <Divider sx={{ my: 0.5 }}/>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
            Vytvořeno {new Date(task.createdAt).toLocaleDateString('cs-CZ')}
          </Typography>
        </>
      )}
    </Box>
  );
}
