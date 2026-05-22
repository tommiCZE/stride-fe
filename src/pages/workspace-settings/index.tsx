import { Alert, Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { WorkspaceGeneralSection } from './sections/general';
import { WorkspaceMembersSection } from './sections/members';
import { WorkspaceIntegrationsSection } from './sections/integrations';
import { WorkspaceSecuritySection } from './sections/security';
import { WorkspaceAuditSection } from './sections/audit';

type SectionId = 'general' | 'members' | 'integrations' | 'security' | 'audit';

interface SectionEntry {
  id: SectionId;
  group: string;
  label: string;
}

const SECTIONS: SectionEntry[] = [
  { id: 'general',      group: 'Workspace', label: 'Obecné' },
  { id: 'members',      group: 'Workspace', label: 'Členové & týmy' },

  { id: 'integrations', group: 'Bezpečnost', label: 'Integrace' },
  { id: 'security',     group: 'Bezpečnost', label: 'Zabezpečení' },
  { id: 'audit',        group: 'Bezpečnost', label: 'Audit log' },
];

const isSectionId = (s: string | undefined): s is SectionId =>
  !!s && SECTIONS.some(x => x.id === s);

export default function WorkspaceSettings() {
  const navigate = useNavigate();
  const { section: sectionParam } = useParams<{ section?: string }>();
  const { isAdmin } = usePermissions();

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const section: SectionId = isSectionId(sectionParam) ? sectionParam : 'general';
  const current = SECTIONS.find(s => s.id === section)!;
  const groups = Array.from(new Set(SECTIONS.map(s => s.group)));

  const setSection = (id: SectionId) => {
    navigate(id === 'general' ? '/settings' : `/settings/${id}`);
  };

  // Workspace settings are admin-only; until per-section permissions exist,
  // admins always have write access here.
  const readOnly = false;

  return (
    <Stack direction="row" sx={{ flex: 1, height: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Box sx={{
        width: 220, flexShrink: 0,
        borderRight: 1, borderColor: 'divider',
        bgcolor: 'background.paper',
        overflowY: 'auto', py: 1.5,
      }}>
        {groups.map((group, gi) => (
          <Box key={group} sx={{ mb: gi === groups.length - 1 ? 0 : 0.5 }}>
            <Typography sx={{
              px: 2, pt: gi === 0 ? 0.25 : 1.5, pb: 0.5,
              fontSize: '12px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'text.disabled',
            }}>{group}</Typography>
            {SECTIONS.filter(s => s.group === group).map(s => {
              const active = s.id === section;
              return (
                <Box
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  sx={{
                    mx: 1, px: 1.25, py: 0.65,
                    cursor: 'pointer', borderRadius: 1,
                    fontSize: '14px',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'primary.main' : 'text.primary',
                    bgcolor: active ? (theme => alpha(theme.palette.primary.main, 0.10)) : 'transparent',
                    '&:hover': { bgcolor: active ? undefined : 'action.hover' },
                  }}
                >{s.label}</Box>
              );
            })}
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Box sx={{
          position: 'sticky', top: 0, zIndex: 1,
          px: 4, pt: 2.5, pb: 1.75,
          bgcolor: 'background.default',
          borderBottom: 1, borderColor: 'divider',
        }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5 }}>
            {current.group} · Acme s.r.o.
          </Typography>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {current.label}
          </Typography>
        </Box>

        <Box sx={{ px: 4, py: 3, maxWidth: 960 }}>
          <Alert severity="info" sx={{ mb: 2, fontSize: '14px' }}>
            Workspace settings se chovají jako default pro nové projekty (Jira-like
            inheritance). Per-projektový override najdeš v Project settings.
          </Alert>

          {section === 'general'      && <WorkspaceGeneralSection      readOnly={readOnly}/>}
          {section === 'members'      && <WorkspaceMembersSection      readOnly={readOnly}/>}
          {section === 'integrations' && <WorkspaceIntegrationsSection readOnly={readOnly}/>}
          {section === 'security'     && <WorkspaceSecuritySection     readOnly={readOnly}/>}
          {section === 'audit'        && <WorkspaceAuditSection/>}
        </Box>
      </Box>
    </Stack>
  );
}
