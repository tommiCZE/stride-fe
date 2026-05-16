import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('cs') ? 'cs' : 'en';

  const toggle = () => {
    i18n.changeLanguage(current === 'cs' ? 'en' : 'cs');
  };

  return (
    <Box
      component="button"
      onClick={toggle}
      sx={{
        display: 'flex', alignItems: 'center', gap: 0.5,
        px: 0.75, py: 0.35, borderRadius: 0.75,
        border: 1, borderColor: 'divider',
        bgcolor: 'transparent', cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: current === 'cs' ? 'primary.main' : 'text.disabled' }}>CS</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>/</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: current === 'en' ? 'primary.main' : 'text.disabled' }}>EN</Typography>
    </Box>
  );
}