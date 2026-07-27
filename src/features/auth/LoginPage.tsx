import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../contexts/AuthContext';
import { colors, radius } from '../../components/ui/tokens';
import { roleHomePaths } from '../../app/routes';
import { AuthLayout } from './AuthLayout';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(roleHomePaths[user.role] ?? '/');
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      navigate(roleHomePaths[user.role] ?? '/');
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      leftTitle="Autoavalia"
      leftSubtitle="Plataforma de autoavaliação pedagógica para professores e gestores escolares."
    >
      <Typography sx={{ fontSize: 26, fontWeight: 600, color: colors.ink, mb: 0.5, letterSpacing: '-0.6px' }}>
        Entrar
      </Typography>
      <Typography sx={{ fontSize: 14, color: colors.inkMuted, mb: 3 }}>
        Acesse sua conta para continuar
      </Typography>

      {error && (
        <Box sx={{ background: 'rgba(220,38,38,0.08)', border: `1px solid ${colors.error}`, borderRadius: `${radius.md}px`, px: 2, py: 1.5, mb: 2 }}>
          <Typography sx={{ fontSize: 13, color: colors.error }}>{error}</Typography>
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          slotProps={{ htmlInput: { 'data-testid': 'email-input' } }}
        />
        <TextField
          fullWidth
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          slotProps={{
            htmlInput: { 'data-testid': 'password-input' },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} size="small" sx={{ color: colors.inkSubtle }}>
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
          <RouterLink to="/forgot-password" style={{ fontSize: 13, color: colors.accent, textDecoration: 'none' }}>
            Esqueci minha senha
          </RouterLink>
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          data-testid="login-submit"
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Entrar'}
        </Button>
      </Box>

      <Divider sx={{ my: 2.5 }}>
        <Typography sx={{ fontSize: 12, color: colors.inkSubtle, px: 1 }}>ou</Typography>
      </Divider>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        startIcon={<GoogleIcon />}
        onClick={handleGoogle}
        disabled={loading}
        sx={{
          mb: 3,
          borderColor: colors.hairlineStrong,
          color: colors.inkMuted,
          background: colors.surface1,
          '&:hover': { background: colors.surface2, borderColor: colors.hairlineStrong },
        }}
      >
        Entrar com Google
      </Button>

      <Typography sx={{ fontSize: 13, color: colors.inkSubtle, textAlign: 'center' }}>
        Não tem conta?{' '}
        <RouterLink to="/register" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 500 }}>
          Criar conta →
        </RouterLink>
      </Typography>
    </AuthLayout>
  );
}
