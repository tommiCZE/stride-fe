import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Popper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { BOARD_STATUSES } from '../../../constants/statuses';
import type { TaskSummaryDto } from '../../../api/types';

interface HoverState {
  el: HTMLElement;
  task: TaskSummaryDto;
}

function lookupTaskByKey(qc: QueryClient, key: string): TaskSummaryDto | undefined {
  const queries = qc.getQueriesData<TaskSummaryDto[]>({ queryKey: ['tasks', 'list'] });
  for (const [, list] of queries) {
    const match = list?.find(t => t.key === key);
    if (match) return match;
  }
  return undefined;
}

export function IssueLinkLayer({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const findIssueLink = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>('a.issue-link[data-issue-key]');
    };

    const onClick = (event: MouseEvent) => {
      const link = findIssueLink(event.target);
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
      const key = link.getAttribute('data-issue-key');
      if (!key) return;
      const task = lookupTaskByKey(qc, key);
      if (!task) return;
      navigate(`/projects/${task.projectId}/board?task=${task.id}`);
    };

    const onMouseOver = (event: MouseEvent) => {
      const link = findIssueLink(event.target);
      if (!link) return;
      const key = link.getAttribute('data-issue-key');
      if (!key) return;
      const task = lookupTaskByKey(qc, key);
      if (!task) return;
      setHover(prev => (prev?.el === link ? prev : { el: link, task }));
    };

    const onMouseOut = (event: MouseEvent) => {
      const link = findIssueLink(event.target);
      if (!link) return;
      const related = event.relatedTarget;
      if (related instanceof Node && link.contains(related)) return;
      setHover(prev => (prev?.el === link ? null : prev));
    };

    container.addEventListener('click', onClick);
    container.addEventListener('mouseover', onMouseOver);
    container.addEventListener('mouseout', onMouseOut);
    return () => {
      container.removeEventListener('click', onClick);
      container.removeEventListener('mouseover', onMouseOver);
      container.removeEventListener('mouseout', onMouseOut);
    };
  }, [navigate, qc]);

  return (
    <Box ref={containerRef}>
      {children}
      <Popper
        open={!!hover}
        anchorEl={hover?.el ?? null}
        placement="top"
        modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
        sx={{ zIndex: theme => theme.zIndex.tooltip, pointerEvents: 'none' }}
      >
        {hover && <IssueLinkTooltipContent task={hover.task} />}
      </Popper>
    </Box>
  );
}

function IssueLinkTooltipContent({ task }: { task: TaskSummaryDto }) {
  const status = BOARD_STATUSES.find(s => s.id === task.status);
  return (
    <Paper
      elevation={6}
      sx={{
        px: 1.25,
        py: 0.875,
        maxWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', letterSpacing: 0.3 }}>
        {task.key}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: 'text.primary' }}>
        {task.title}
      </Typography>
      {status && (
        <Box
          sx={{
            mt: 0.25,
            display: 'inline-flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: 0.5,
            px: 0.75,
            py: 0.125,
            borderRadius: 0.75,
            fontSize: 10.5,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            color: status.color,
            backgroundColor: alpha(status.color, 0.12),
          }}
        >
          <Box
            component="span"
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: status.color,
              display: 'inline-block',
            }}
          />
          {status.name}
        </Box>
      )}
    </Paper>
  );
}
