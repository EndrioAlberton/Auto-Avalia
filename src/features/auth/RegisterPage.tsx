import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { colors, radius } from '../../components/tokens';
import { roleHomePaths } from '../../app/routes';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    role: UserRole.PROFESSOR as string,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('As senhas não coincidem.'); return; }
    if (form.password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return; }
    setLoading(true);
    try {
      const user = await register(form.email, form.password, form.displayName, form.role as UserRole);
      navigate(roleHomePaths[user.role] ?? '/');
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Erro ao criar conta');
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
          Crie sua conta e comece a acompanhar a evolução pedagógica da sua escola.
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
        }}
      >
        <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
          <Typography sx={{ display: { xs: 'block', md: 'none' }, fontSize: 24, fontWeight: 700, color: colors.accent, mb: 3 }}>
            Autoavalia
          </Typography>

          <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.ink, mb: 0.5, letterSpacing: '-0.6px' }}>
            Criar conta
          </Typography>
          <Typography sx={{ fontSize: 14, color: colors.inkMuted, mb: 3 }}>
            Preencha os dados abaixo para começar
          </Typography>

          {error && (
            <Box sx={{ background: 'rgba(220,38,38,0.08)', border: `1px solid ${colors.error}`, borderRadius: `${radius.md}px`, px: 2, py: 1.5, mb: 2 }}>
              <Typography sx={{ fontSize: 13, color: colors.error }}>{error}</Typography>
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap={2} mb={2}>
            <TextField
              fullWidth required
              label="Nome completo"
              name="displayName"
              value={form.displayName}
              onChange={handleChange as any}
              autoComplete="name"
            />
            <TextField
              fullWidth required
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange as any}
              autoComplete="email"
            />
            <FormControl fullWidth required>
              <InputLabel>Perfil</InputLabel>
              <Select name="role" value={form.role} onChange={handleChange as any} label="Perfil">
                <MenuItem value={UserRole.PROFESSOR}>Professor</MenuItem>
                <MenuItem value={UserRole.GESTOR}>Gestor</MenuItem>
                <MenuItem value={UserRole.SECRETARIA}>Secretaria</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth required
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange as any}
              autoComplete="new-password"
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
            <TextField
              fullWidth required
              label="Confirmar senha"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange as any}
              autoComplete="new-password"
            />
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Criar conta'}
          </Button>

          <Typography sx={{ fontSize: 13, color: colors.inkSubtle, textAlign: 'center' }}>
            Já tem conta?{' '}
            <RouterLink to="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 500 }}>
              Entrar →
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
