import { Box, Divider, Typography } from '@mui/material';
import { SectionLabel } from '../../../components/ui/ui';
import FluxAvatar from '../../../components/flux-avatar';
import { timeAgo } from '../../../mocks/data';
import { FieldRow } from '../fields/field-helpers';
import {
  AssigneeEditor, PriorityEditor, TypeEditor, EpicEditor,
  SprintEditor, LabelsEditor, EstimateEditor, DueDateEditor, LoggedBar,
} from '../fields/field-editors';
import type { Task, User } from '../../../types';

interface Props {
  task: Task;
  reporter: User | null;
  updateTask: (fn: (t: Task) => Task) => void;
}

export default function TaskDetailSidebar({ task, reporter, updateTask }: Props) {
  return (
    <Box sx={{ borderLeft: { xs: 0, md: 1 }, borderTop: { xs: 1, md: 0 }, borderColor: 'divider',
      bgcolor: 'background.paper', overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <SectionLabel>Detaily</SectionLabel>
      <FieldRow label="Assignee">
        <AssigneeEditor task={task} setTask={updateTask}/>
      </FieldRow>
      <FieldRow label="Reporter">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12.5 }}>
          <FluxAvatar user={reporter} size={20}/> {reporter?.name}
        </Box>
      </FieldRow>
      <FieldRow label="Priorita">
        <PriorityEditor task={task} setTask={updateTask}/>
      </FieldRow>
      <FieldRow label="Typ">
        <TypeEditor task={task} setTask={updateTask}/>
      </FieldRow>
      <FieldRow label="Epic">
        <EpicEditor task={task} setTask={updateTask}/>
      </FieldRow>
      <FieldRow label="Sprint">
        <SprintEditor task={task} setTask={updateTask}/>
      </FieldRow>
      <FieldRow label="Štítky">
        <LabelsEditor task={task} setTask={updateTask}/>
      </FieldRow>
      <FieldRow label="Estimate">
        <EstimateEditor task={task} setTask={updateTask}/>
      </FieldRow>
      <FieldRow label="Logged">
        <LoggedBar logged={task.logged} estimate={task.estimate ?? undefined}/>
      </FieldRow>
      <FieldRow label="Due">
        <DueDateEditor task={task} setTask={updateTask}/>
      </FieldRow>
      {task.links.length > 0 && (
        <>
          <Divider sx={{ my: 1 }}/>
          <SectionLabel>Vazby</SectionLabel>
          {task.links.map((l, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12 }}>
              <Typography sx={{ fontSize: 11, color: 'text.disabled', width: 56 }}>
                {l.type === 'blocks' ? 'blokuje' : 'souvisí'}
              </Typography>
              <Typography sx={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'info.main' }}>{l.key}</Typography>
            </Box>
          ))}
        </>
      )}
      <Divider sx={{ my: 1 }}/>
      <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
        Vytvořeno {timeAgo(task.created)} · Aktualizováno {timeAgo(task.updated)}
      </Typography>
    </Box>
  );
}
