import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { resetPassword } from '../../services/authService';
import { colors, radius } from '../../components/ui/tokens';
import { AuthLayout } from './AuthLayout';

const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const send = async () => {
    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Erro ao enviar o e-mail de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send();
  };

  return (
    <AuthLayout
      leftTitle="Autoavalia"
      leftSubtitle="Recupere o acesso à sua conta em poucos segundos."
    >
      <Typography sx={{ fontSize: 26, fontWeight: 600, color: colors.ink, mb: 0.5, letterSpacing: '-0.6px' }}>
        Recuperar senha
      </Typography>
      <Typography sx={{ fontSize: 14, color: colors.inkMuted, mb: 3 }}>
        Informe seu e-mail e enviaremos um link para criar uma nova senha
      </Typography>

      {error && (
        <Box sx={{ background: 'rgba(220,38,38,0.08)', border: `1px solid ${colors.error}`, borderRadius: `${radius.md}px`, px: 2, py: 1.5, mb: 2 }}>
          <Typography sx={{ fontSize: 13, color: colors.error }}>{error}</Typography>
        </Box>
      )}

      {sent ? (
        <>
          {/* Mensagem deliberadamente neutra: confirmar que a conta existe
              permitiria descobrir quais e-mails estão cadastrados. */}
          <Box sx={{ background: 'rgba(22,163,74,0.08)', border: `1px solid ${colors.success}`, borderRadius: `${radius.md}px`, px: 2, py: 1.5, mb: 3 }}>
            <Typography sx={{ fontSize: 13, color: colors.ink, lineHeight: 1.6 }}>
              Se existir uma conta para <strong>{email.trim()}</strong>, enviamos um link de
              redefinição de senha. Verifique também a caixa de spam.
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={send}
            disabled={loading || cooldown > 0}
            sx={{ mb: 3, borderColor: colors.hairlineStrong, color: colors.inkMuted }}
          >
            {cooldown > 0 ? `Enviar novamente em ${cooldown}s` : 'Enviar novamente'}
          </Button>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2} mb={3}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            slotProps={{ htmlInput: { 'data-testid': 'forgot-email-input' } }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !email.trim()}
            data-testid="forgot-submit"
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Enviar link de recuperação'}
          </Button>
        </Box>
      )}

      <Typography sx={{ fontSize: 13, color: colors.inkSubtle, textAlign: 'center' }}>
        <RouterLink to="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 500 }}>
          ← Voltar para o login
        </RouterLink>
      </Typography>
    </AuthLayout>
  );
}
