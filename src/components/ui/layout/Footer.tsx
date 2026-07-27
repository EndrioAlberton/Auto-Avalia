import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import { colors } from '../tokens';

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.accent,
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Sobre o Projeto
            </Typography>
            <Typography variant="body2">
              Plataforma de autoavaliação e diagnóstico pedagógico para professores, gestores e estudantes.
              Desenvolvida como parte do projeto de Inovação Pedagógica na Educação Básica (Edital INOVA EAD CAPES/2023).
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Instituição
            </Typography>
            <Typography variant="body2">
              Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Campus Porto Alegre
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon />
              Colaboradores
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Coordenação:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Profa. Carine Bueira Loureiro (MPIE/IFRS)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Colaboradora:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Profa. Silvia de Castro Bertagnolli (MPI/IFRS)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Desenvolvimento:
            </Typography>
            <Typography variant="body2">
              Bolsista de IC: Endrio Alberton Correa Nunes (SSI/IFRS)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium', mt: 1 }}>
              Contato:
            </Typography>
            <Typography variant="body2">
              <Link
                href="mailto:endrio@maxiquim.com.br"
                sx={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                endrio.alberton@gmail.com
              </Link>
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
          © {new Date().getFullYear()} - Grupo de Estudos e Pesquisa em Educação, Matemática e Tecnologias
        </Typography>
      </Container>
    </Box>
  );
}
