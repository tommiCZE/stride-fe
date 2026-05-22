import { useState } from 'react';
import { Alert, Box, Button, Chip, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import FluxAvatar from '../../../components/flux-avatar';
import { SectionHeader, SettingsCard } from '../../settings/shared';
import { useWorkspaceAudit, useExportWorkspaceAudit } from '../../../hooks/useWorkspaceAudit';
import type { AuditSearchParams, WorkspaceAuditEntryDto } from '../../../api/workspace-audit';
import { AuditFilters } from './audit-filters';
import { AuditDetailDrawer } from './audit-detail-drawer';
import { actionLabel, sectionColor } from './audit-action-meta';
import { absoluteDateTime, relativeTime } from './relative-time';

export function WorkspaceAuditSection() {
  const [params, setParams] = useState<AuditSearchParams>({ page: 0, size: 20 });
  const [selected, setSelected] = useState<WorkspaceAuditEntryDto | null>(null);

  const { data, isLoading, isFetching } = useWorkspaceAudit(params);
  const exportCsv = useExportWorkspaceAudit();

  const totalElements = data?.totalElements ?? 0;
  const rows = data?.content ?? [];

  const handleFiltersChange = (filters: AuditSearchParams) => {
    setParams({ ...filters, page: 0, size: params.size ?? 20 });
  };

  return (
    <>
      <SectionHeader hint="Append-only log akcí na úrovni workspace — pozvánky, změny rolí, integrace, politika zabezpečení." />

      <AuditFilters
        value={params}
        onChange={handleFiltersChange}
      />

      <SettingsCard
        title={
          isLoading ? 'Načítám…' :
          `${totalElements} ${plural(totalElements, 'záznam', 'záznamy', 'záznamů')}`
        }
        action={
          <Button
            size="small" variant="outlined" color="inherit"
            disabled={totalElements === 0 || exportCsv.isPending}
            onClick={() => exportCsv.mutate(stripPaging(params))}
          >
            {exportCsv.isPending ? 'Exportuji…' : 'Export CSV'}
          </Button>
        }
      >
        {isLoading ? (
          <Stack spacing={1} >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={42}/>
            ))}
          </Stack>
        ) : rows.length === 0 ? (
          <Typography sx={{ fontSize: '14px', color: 'text.disabled', py: 4, textAlign: 'center' }}>
            Pro zvolené filtry nejsou žádné záznamy.
          </Typography>
        ) : (
          <Box sx={{ position: 'relative', mx: -2.5, opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', width: 150 }}>Kdy</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aktor</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Akce</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cíl</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', width: 110 }}>Zdroj</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    onClick={() => setSelected(r)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell sx={{ fontSize: '12px', fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}>
                      <Box>{absoluteDateTime(r.occurredAt).slice(0, 16)}</Box>
                      <Box sx={{ fontSize: '11px', color: 'text.disabled' }}>{relativeTime(r.occurredAt)}</Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <FluxAvatar user={r.actorName
                          ? { color: r.actorColor ?? '#64748b', initials: r.actorInitials ?? '?' }
                          : null} size={22}/>
                        <Typography sx={{ fontSize: '13px' }}>
                          {r.actorName ?? <Typography component="span" sx={{ fontSize: '13px', color: 'text.disabled' }}>Systém</Typography>}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={actionLabel(r.action)}
                        sx={{
                          bgcolor: theme => sectionColor(r.section, theme) + '1f',
                          color: theme => sectionColor(r.section, theme),
                          fontWeight: 600, fontSize: '12px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', color: 'text.secondary', maxWidth: 320,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.target ?? r.summary}
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', color: 'text.disabled', fontFamily: 'ui-monospace, monospace' }}>
                      {r.ip ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalElements}
              page={params.page ?? 0}
              onPageChange={(_, p) => setParams({ ...params, page: p })}
              rowsPerPage={params.size ?? 20}
              onRowsPerPageChange={(e) => setParams({ ...params, page: 0, size: Number(e.target.value) })}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="Řádků na stránku"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} z ${count}`}
            />
          </Box>
        )}
      </SettingsCard>

      {totalElements === 0 && !isLoading && (
        <Alert severity="info" sx={{ fontSize: '13px' }}>
          Záznamy do audit logu se přidají automaticky po jakékoliv změně ve workspace
          (pozvání člena, změna role, připojení integrace, změna politiky zabezpečení).
        </Alert>
      )}

      <AuditDetailDrawer entry={selected} onClose={() => setSelected(null)}/>
    </>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

function stripPaging(p: AuditSearchParams): AuditSearchParams {
  const { page: _p, size: _s, ...rest } = p;
  void _p; void _s;
  return rest;
}
