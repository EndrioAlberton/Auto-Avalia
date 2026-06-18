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
    <Box sx={{ minHeight: '100vh', display: 'flex', background: colors.canvas }}>
      {/* Left panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '40%',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 6,
          borderRight: `1px solid ${colors.hairline}`,
        }}
      >
        <Typography sx={{ fontSize: 32, fontWeight: 700, color: colors.accent, mb: 1 }}>
          Autoavalia
        </Typography>
        <Typography sx={{ fontSize: 18, color: colors.inkMuted, lineHeight: 1.5 }}>
          Plataforma de autoavaliação pedagógica para professores e gestores escolares.
        </Typography>
      </Box>

      {/* Right panel */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, md: 8 },
          background: colors.surface1,
          maxWidth: { xs: '100%', md: '60%' },
        }}
      >
        <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
          {/* Mobile logo */}
          <Typography sx={{ display: { xs: 'block', md: 'none' }, fontSize: 24, fontWeight: 700, color: colors.accent, mb: 3 }}>
            Autoavalia
          </Typography>

          <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.ink, mb: 0.5, letterSpacing: '-0.6px' }}>
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

          <Box display="flex" flexDirection="column" gap={2} mb={2}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputProps={{ 'data-testid': 'email-input' }}
            />
            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              inputProps={{ 'data-testid': 'password-input' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} size="small" sx={{ color: colors.inkSubtle }}>
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            data-testid="login-submit"
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Entrar'}
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography sx={{ fontSize: 12, color: colors.inkSubtle, px: 1 }}>ou</Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogle}
            disabled={loading}
            sx={{ mb: 3, borderColor: colors.hairline, color: colors.inkMuted }}
          >
            Entrar com Google
          </Button>

          <Typography sx={{ fontSize: 13, color: colors.inkSubtle, textAlign: 'center' }}>
            Não tem conta?{' '}
            <RouterLink to="/register" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 500 }}>
              Criar conta →
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
