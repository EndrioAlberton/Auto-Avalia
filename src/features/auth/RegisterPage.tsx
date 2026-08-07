import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';
import { colors, radius } from '../../components/ui/tokens';
import { roleHomePaths } from '../../app/routes';
import { AuthLayout } from './AuthLayout';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
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
      const user = await register(form.email, form.password, form.displayName);
      navigate(roleHomePaths[user.role] ?? '/');
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      leftTitle="Autoavalia"
      leftSubtitle="Crie sua conta e comece a acompanhar a evolução pedagógica da sua escola."
    >
      <Typography sx={{ fontSize: 26, fontWeight: 600, color: colors.ink, mb: 0.5, letterSpacing: '-0.6px' }}>
        Criar conta
      </Typography>
      <Typography sx={{ fontSize: 14, color: colors.inkMuted, mb: 1 }}>
        Preencha os dados abaixo para começar
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: colors.inkSubtle, mb: 3, lineHeight: 1.5 }}>
        Toda nova conta é criada como Professor. O gestor da sua escola faz o convite,
        e os demais acessos são concedidos pela administração da rede.
      </Typography>

      {error && (
        <Box sx={{ background: 'rgba(220,38,38,0.08)', border: `1px solid ${colors.error}`, borderRadius: `${radius.md}px`, px: 2, py: 1.5, mb: 2 }}>
          <Typography sx={{ fontSize: 13, color: colors.error }}>{error}</Typography>
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
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
        <TextField
          fullWidth required
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={form.password}
          onChange={handleChange as any}
          autoComplete="new-password"
          slotProps={{
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
        <TextField
          fullWidth required
          label="Confirmar senha"
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange as any}
          autoComplete="new-password"
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Criar conta'}
        </Button>
      </Box>

      <Typography sx={{ fontSize: 13, color: colors.inkSubtle, textAlign: 'center', mt: 3 }}>
        Já tem conta?{' '}
        <RouterLink to="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 500 }}>
          Entrar →
        </RouterLink>
      </Typography>
    </AuthLayout>
  );
}
