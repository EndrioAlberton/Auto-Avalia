export const colors = {
  canvas:          '#f7f6f3',
  surface1:        '#ffffff',
  surface2:        '#f1f0ed',
  surface3:        '#f9f8f6',
  hairline:        '#e9e5e0',
  hairlineStrong:  '#d3cec4',
  ink:             '#37352f',
  inkMuted:        '#73726e',
  inkSubtle:       '#9b9a97',
  inkTertiary:     '#b5b4b1',
  accent:          '#5e6ad2',
  accentHover:     '#4a56c1',
  accentDim:       '#eef0fb',
  success:         '#16a34a',
  warning:         '#d97706',
  error:           '#dc2626',
} as const;

export const domainColors = {
  domain0: '#5e6ad2',
  domain1: '#7c3ae7',
  domain2: '#0ea5e9',
  domain3: '#10b981',
  domain4: '#f59e0b',
} as const;

export const typography = {
  fontFamily: 'Inter, -apple-system, system-ui, Segoe UI, Helvetica, sans-serif',
  display:   { size: 40, weight: 600, tracking: -1.0 },
  headline:  { size: 28, weight: 600, tracking: -0.6 },
  cardTitle: { size: 22, weight: 500, tracking: -0.4 },
  subhead:   { size: 20, weight: 400, tracking: -0.2 },
  bodyLg:    { size: 18, weight: 400, tracking: -0.1 },
  body:      { size: 16, weight: 400, tracking: -0.05 },
  bodySm:    { size: 14, weight: 400, tracking: 0 },
  caption:   { size: 12, weight: 400, tracking: 0 },
  eyebrow:   { size: 13, weight: 500, tracking: 0.4 },
  button:    { size: 14, weight: 500, tracking: 0 },
  mono:      { size: 13, weight: 400, tracking: 0 },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 96,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
} as const;

export const motion = {
  fast: '150ms',
  base: '250ms',
  slow: '400ms',
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;
