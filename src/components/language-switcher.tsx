import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('cs') ? 'cs' : 'en';

  const toggle = () => {
    i18n.changeLanguage(current === 'cs' ? 'en' : 'cs');
  };

  return (
    <Stack direction="row" spacing={0.5}
      component="button"
      onClick={toggle}
      sx={{
        alignItems: 'center', px: 0.75, py: 0.35, borderRadius: 0.75,
        border: 1, borderColor: 'divider',
        bgcolor: 'transparent', cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' } }}
    >
      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: current === 'cs' ? 'primary.main' : 'text.disabled' }}>CS</Typography>
      <Typography sx={{ fontSize: '14px', color: 'text.disabled' }}>/</Typography>
      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: current === 'en' ? 'primary.main' : 'text.disabled' }}>EN</Typography>
    </Stack>
  );
}