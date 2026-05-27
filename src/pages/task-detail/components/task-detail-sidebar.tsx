import { Divider, Stack, Tooltip, Typography } from '@mui/material';
import { SectionLabel } from '../../../components/ui/ui';
import FluxAvatar from '../../../components/flux-avatar';
import { FieldRow } from '../fields/field-helpers';
import {
  AssigneeEditor, PriorityEditor, TypeEditor, EpicEditor,
  SprintEditor, LabelsEditor, DueDateEditor,
  FixVersionEditor, EstimateProgressCard,
  type PatchFn,
} from '../fields/field-editors';
import { DevSidebarWidget } from '../dev/dev-sidebar-widget';
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
    <Stack spacing={1.25} sx={{ borderLeft: { xs: 0, md: 1 }, borderTop: { xs: 1, md: 0 }, borderColor: 'divider',
      bgcolor: 'background.paper', overflowY: 'auto', p: 2 }}>

      <SectionLabel>Lidé</SectionLabel>
      <FieldRow label="Assignee">
        <AssigneeEditor task={task} onPatch={onPatch}/>
      </FieldRow>
      <FieldRow label="Reporter">
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', fontSize: '14px' }}>
          <FluxAvatar user={task.reporter} size={20}/> {task.reporter?.name}
        </Stack>
      </FieldRow>
      <FieldRow label="Sledující">
        {watchers.length > 0 ? (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {visibleWatchers.map(w => (
              <Tooltip key={w.id} title={w.name}>
                <span><FluxAvatar user={w} size={20}/></span>
              </Tooltip>
            ))}
            {extraWatchers > 0 && (
              <Typography sx={{ fontSize: '11px', color: 'text.disabled', ml: 0.25 }}>
                +{extraWatchers}
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography sx={{ fontSize: '13px', color: 'text.disabled' }}>Nikdo</Typography>
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

      <Divider sx={{ my: 1 }}/>
      <DevSidebarWidget
        taskId={task.id}
        taskKey={task.key}
        taskTitle={task.title}
        projectId={task.projectId}
      />

      {task.createdAt && (
        <>
          <Divider sx={{ my: 0.5 }}/>
          <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>
            Vytvořeno {new Date(task.createdAt).toLocaleDateString('cs-CZ')}
          </Typography>
        </>
      )}
    </Stack>
  );
}
