import { Box, Divider, Tooltip, Typography } from '@mui/material';
import { SectionLabel } from '../../../components/ui/ui';
import FluxAvatar from '../../../components/flux-avatar';
import { FieldRow } from '../fields/field-helpers';
import {
  AssigneeEditor, PriorityEditor, TypeEditor, EpicEditor,
  SprintEditor, LabelsEditor, DueDateEditor,
  FixVersionEditor, EstimateProgressCard,
  type PatchFn,
} from '../fields/field-editors';
import { useWatchers } from '../../../hooks/useWatchers';
import type { TaskDto } from '../../../api/types';

interface Props {
  task: TaskDto;
  onPatch: PatchFn;
}

export default function TaskDetailSidebar({ task, onPatch }: Props) {
  const { data: watchers = [] } = useWatchers(task.id);
  const visibleWatchers = watchers.slice(0, 4);
  const extraWatchers = watchers.length - visibleWatchers.length;

  return (
    <Box sx={{ borderLeft: { xs: 0, md: 1 }, borderTop: { xs: 1, md: 0 }, borderColor: 'divider',
      bgcolor: 'background.paper', overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>

      <SectionLabel>Lidé</SectionLabel>
      <FieldRow label="Assignee">
        <AssigneeEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Reporter">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 14 }}>
          <FluxAvatar user={task.reporter} size={20}/> {task.reporter?.name}
        </Box>
      </FieldRow>
      <FieldRow label="Sledující">
        {watchers.length > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {visibleWatchers.map(w => (
              <Tooltip key={w.id} title={w.name}>
                <span><FluxAvatar user={w} size={20}/></span>
              </Tooltip>
            ))}
            {extraWatchers > 0 && (
              <Typography sx={{ fontSize: 11, color: 'text.disabled', ml: 0.25 }}>
                +{extraWatchers}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>Nikdo</Typography>
        )}
      </FieldRow>

      <Divider sx={{ my: 1 }}/>
      <SectionLabel>Plánování</SectionLabel>
      <FieldRow label="Sprint">
        <SprintEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Epic">
        <EpicEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Due">
        <DueDateEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Fix version">
        <FixVersionEditor task={task} onPatch={onPatch}/>
      </FieldRow>

      <Divider sx={{ my: 1 }}/>
      <SectionLabel>Práce</SectionLabel>
      <FieldRow label="Estimate">
        <EstimateProgressCard task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Štítky">
        <LabelsEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Typ">
        <TypeEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Priorita">
        <PriorityEditor task={task} onPatch={onPatch}/>
      </FieldRow>

      {task.createdAt && (
        <>
          <Divider sx={{ my: 0.5 }}/>
          <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
            Vytvořeno {new Date(task.createdAt).toLocaleDateString('cs-CZ')}
          </Typography>
        </>
      )}
    </Box>
  );
}
