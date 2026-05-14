import { createTheme } from '@mui/material/styles';
import { colors, typography, radius } from './tokens';

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: colors.canvas,
      paper: colors.surface1,
    },
    primary: {
      main: colors.accent,
      light: '#828fff',
      dark: colors.accentHover,
      contrastText: '#ffffff',
    },
    text: {
      primary: colors.ink,
      secondary: colors.inkMuted,
      disabled: colors.inkSubtle,
    },
    divider: colors.hairline,
    success: { main: colors.success },
    warning: { main: colors.warning },
    error:   { main: colors.error },
  },
  typography: {
    fontFamily: typography.fontFamily,
    h1: { fontSize: `${typography.display.size}px`,   fontWeight: typography.display.weight,   letterSpacing: `${typography.display.tracking}px` },
    h2: { fontSize: `${typography.headline.size}px`,  fontWeight: typography.headline.weight,  letterSpacing: `${typography.headline.tracking}px` },
    h3: { fontSize: `${typography.cardTitle.size}px`, fontWeight: typography.cardTitle.weight, letterSpacing: `${typography.cardTitle.tracking}px` },
    h4: { fontSize: `${typography.subhead.size}px`,   fontWeight: typography.subhead.weight,   letterSpacing: `${typography.subhead.tracking}px` },
    h5: { fontSize: `${typography.bodyLg.size}px`,    fontWeight: typography.bodyLg.weight,    letterSpacing: `${typography.bodyLg.tracking}px` },
    h6: { fontSize: `${typography.body.size}px`,      fontWeight: typography.body.weight,      letterSpacing: `${typography.body.tracking}px` },
    body1: { fontSize: `${typography.body.size}px`,   fontWeight: typography.body.weight },
    body2: { fontSize: `${typography.bodySm.size}px`, fontWeight: typography.bodySm.weight },
    caption: { fontSize: `${typography.caption.size}px` },
    button: { fontSize: `${typography.button.size}px`, fontWeight: typography.button.weight, textTransform: 'none' as const },
  },
  shape: {
    borderRadius: radius.md,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: colors.surface1,
          border: `1px solid ${colors.hairline}`,
          borderRadius: radius.lg,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          textTransform: 'none',
          fontWeight: 500,
          '&:active': { transform: 'scale(0.98)' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.hairline,
          color: colors.inkMuted,
        },
        head: {
          background: colors.surface2,
          color: colors.inkSubtle,
          fontSize: `${typography.eyebrow.size}px`,
          fontWeight: typography.eyebrow.weight,
          letterSpacing: `${typography.eyebrow.tracking}px`,
          textTransform: 'uppercase',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          background: colors.surface1,
          '&:hover fieldset': { borderColor: `${colors.hairlineStrong} !important` },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: colors.hairline,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: colors.hairline },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: colors.ink,
          color: colors.surface1,
          fontSize: `${typography.bodySm.size}px`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: colors.surface1,
          color: colors.ink,
          boxShadow: 'none',
          borderBottom: `1px solid ${colors.hairline}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: colors.surface1,
          borderRight: `1px solid ${colors.hairline}`,
        },
      },
    },
  },
});

export default theme;
