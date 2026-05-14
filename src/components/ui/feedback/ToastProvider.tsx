import React, { createContext, useCallback, useContext, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { colors, radius } from '../tokens';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx.toast;
}

let _id = 0;

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircleOutlineIcon fontSize="small" sx={{ color: colors.success }} />,
  error:   <ErrorOutlineIcon fontSize="small" sx={{ color: colors.error }} />,
  info:    <InfoOutlinedIcon fontSize="small" sx={{ color: colors.accent }} />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType) => {
    const id = ++_id;
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });
    setTimeout(() => dismiss(id), 3000);
  }, [dismiss]);

  const toast = {
    success: (msg: string) => add(msg, 'success'),
    error:   (msg: string) => add(msg, 'error'),
    info:    (msg: string) => add(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <Box
            key={t.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              background: colors.surface2,
              border: `1px solid ${colors.hairlineStrong}`,
              borderRadius: `${radius.md}px`,
              px: 2,
              py: 1.5,
              pointerEvents: 'all',
              '@keyframes slideIn': {
                from: { transform: 'translateX(40px)', opacity: 0 },
                to:   { transform: 'translateX(0)',    opacity: 1 },
              },
              animation: 'slideIn 250ms cubic-bezier(0.16,1,0.3,1)',
              minWidth: 280,
              maxWidth: 360,
            }}
          >
            {iconMap[t.type]}
            <Typography sx={{ fontSize: 14, color: colors.ink, flex: 1 }}>{t.message}</Typography>
            <IconButton size="small" onClick={() => dismiss(t.id)} sx={{ color: colors.inkSubtle, flexShrink: 0 }}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        ))}
      </Box>
    </ToastContext.Provider>
  );
}
