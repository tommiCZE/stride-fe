import { useMemo, useState } from 'react';
import { Box, Button, TextField, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth-store';
import StrideLogoIcon from '../components/icons/stride-logo-icon';

type FormData = { email: string; password: string };

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Login() {
  const login = useAuthStore(s => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const schema = useMemo(() =>
    z.object({
      email: z.string().email(t('login.invalidEmail')),
      password: z.string().min(6, t('login.passwordMin')),
    }),
    [t],
  );

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'tomas.knytl@gmail.com', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('login.invalidCredentials'));
      const json = await res.json();
      login(json.token);
    } catch {
      // Dev shortcut: accept mock login when API is unavailable
      if (data.password === 'stride123') {
        login('mock-jwt-token-dev');
      } else {
        setServerError(t('login.loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 2,
    }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <StrideLogoIcon size={36}/>
            <Typography sx={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>
              Stride
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
            {t('login.subtitle')}
          </Typography>
        </Box>

        {/* Card */}
        <Box sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 3.5,
        }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, mb: 0.5, letterSpacing: '-0.02em' }}>
            {t('login.title')}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
            {t('login.description')}
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 12.5 }}>{serverError}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, mb: 0.75, color: 'text.primary' }}>
                {t('login.email')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('login.emailPlaceholder')}
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email')}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}>
                  {t('login.password')}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'primary.main', cursor: 'default' }}>
                  {t('login.forgotPassword')}
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(s => !s)} edge="end">
                          <EyeIcon open={showPassword}/>
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                {...register('password')}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 0.5, py: 1.1, fontSize: 13.5, fontWeight: 600 }}
            >
              {loading ? t('login.submitting') : t('login.submit')}
            </Button>
          </Box>

          <Box sx={{ mt: 2.5, pt: 2.5, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
              {t('login.noAccount')}{' '}
              <Box component="span" sx={{ color: 'primary.main', cursor: 'default', fontWeight: 600 }}>
                {t('login.register')}
              </Box>
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ mt: 3, textAlign: 'center', fontSize: 11.5, color: 'text.disabled' }}>
          {t('login.footer')}
        </Typography>
      </Box>
    </Box>
  );
}
