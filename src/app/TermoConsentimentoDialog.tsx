import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { colors } from '../components/ui/tokens';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/firestoreService';

// Termo enviado pelo pesquisador Ricardo Germann Vieira (IFRS/MPIE) em 23/09/2026.
const PARAGRAFOS = [
  'Pesquisa: Autodiagnóstico Digital em Educação: um estudo de educação comparada entre Porto Alegre e Lisboa',
  'Programa: Mestrado Profissional em Informática na Educação (MPIE) – Instituto Federal do Rio Grande do Sul (IFRS), Campus Porto Alegre',
  'Pesquisador responsável: Ricardo Germann Vieira',
  'Orientadora: Prof.ª Dr.ª Carine Bueira Loureiro (IFRS) | Coorientadora: Prof.ª Dr.ª Joana Viana (ULISBOA)',
  'Prezado(a) professor(a),',
  'Você está sendo convidado(a) a participar, de forma voluntária, desta pesquisa, que tem como objetivo avaliar a Autoavalia, plataforma de autodiagnóstico digital desenvolvida como produto educacional para a Rede Municipal de Ensino de Porto Alegre (RME-POA).',
  'Como será sua participação: após aceitar este termo, você responderá a um questionário nesta plataforma.',
  'Anonimato e confidencialidade: o login, feito com conta própria, Educar ou Gmail, é utilizado apenas para acessar a plataforma. Nenhum dado de identificação, como nome, e-mail ou CPF, é armazenado ou vinculado às suas respostas. As respostas serão analisadas de forma agregada e utilizadas exclusivamente para fins acadêmicos, podendo ser divulgadas na dissertação, em artigos e em eventos científicos, sem qualquer identificação dos participantes.',
  'Riscos e benefícios: os riscos são mínimos, podendo envolver cansaço ou desconforto ao responder alguma questão. Você pode deixar perguntas sem resposta ou interromper o preenchimento a qualquer momento. Como benefício, sua participação contribuirá para o aprimoramento de uma ferramenta de apoio ao desenvolvimento digital das escolas da rede.',
  'Voluntariedade: a participação é livre e não envolve qualquer custo ou remuneração. Recusar-se a participar ou desistir não trará nenhum prejuízo a você ou à sua relação com a escola, a SMED ou o IFRS. Como as respostas são anônimas, não será possível excluí-las após o envio.',
  'Declaro que li e compreendi as informações acima.',
];

const EMAIL_CONTATO = 'ricardo.germannvieira@gmail.com';
const WHATSAPP_CONTATO = '(51) 99204-4916';

interface TermoConsentimentoDialogProps {
  /** Modo leitura: usuário já aceitou e só quer reler o termo — mostra "Fechar" em vez de Aceito/Não aceito. */
  onClose?: () => void;
}

export function TermoConsentimentoDialog({ onClose }: TermoConsentimentoDialogProps) {
  const { currentUser, logout } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleAceitar = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, { tcleAceito: true, tcleAceitoEm: new Date() });
    } finally {
      setSaving(false);
    }
  };

  const handleRecusar = async () => {
    setSaving(true);
    await logout();
  };

  return (
    <Dialog
      open
      onClose={() => onClose?.()}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { background: colors.surface2, border: `1px solid ${colors.hairline}` } }}
    >
      <DialogTitle sx={{ color: colors.ink }}>Termo de Consentimento Livre e Esclarecido</DialogTitle>
      <DialogContent dividers sx={{ borderColor: colors.hairline }}>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {PARAGRAFOS.slice(0, -1).map((p, i) => (
            <Typography key={i} sx={{ fontSize: 13.5, color: colors.ink, lineHeight: 1.6 }}>
              {p}
            </Typography>
          ))}
          <Typography sx={{ fontSize: 13.5, color: colors.ink, lineHeight: 1.6 }}>
            Contato: em caso de dúvidas, entre em contato com o pesquisador pelo e-mail{' '}
            <Link href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</Link> ou pelo WhatsApp{' '}
            <Link href="https://wa.me/5551992044916" target="_blank" rel="noopener noreferrer">
              {WHATSAPP_CONTATO}
            </Link>
            .
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: colors.ink, lineHeight: 1.6 }}>
            {PARAGRAFOS[PARAGRAFOS.length - 1]}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {onClose ? (
          <Button variant="contained" onClick={onClose}>
            Fechar
          </Button>
        ) : (
          <>
            <Button onClick={handleRecusar} disabled={saving} sx={{ color: colors.inkMuted }}>
              Não aceito
            </Button>
            <Button
              variant="contained"
              onClick={handleAceitar}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              Aceito participar da pesquisa
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
