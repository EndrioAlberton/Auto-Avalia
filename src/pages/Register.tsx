import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.PROFESSOR,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const user = await register(
        formData.email,
        formData.password,
        formData.displayName,
        formData.role
      );
      navigate(`/${user.role}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cadastro - SELF</title>
      </Helmet>
      
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Criar Conta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema Educacional de Learning e Formação
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="email"
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Perfil</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Perfil"
                  onChange={handleChange as any}
                >
                  <MenuItem value={UserRole.PROFESSOR}>Professor</MenuItem>
                  <MenuItem value={UserRole.GESTOR}>Gestor Escolar</MenuItem>
                  <MenuItem value={UserRole.ESTUDANTE}>Estudante</MenuItem>
                  <MenuItem value={UserRole.SECRETARIA}>Secretaria/Rede</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="new-password"
                helperText="Mínimo de 6 caracteres"
              />

              <TextField
                fullWidth
                label="Confirmar Senha"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="new-password"
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <Box mt={3} textAlign="center">
              <Typography variant="body2">
                Já tem uma conta?{' '}
                <Link component={RouterLink} to="/login" underline="hover">
                  Faça login
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default Register;
