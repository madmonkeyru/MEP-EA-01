export const tokens = {
  color: {
    primary: '#3730a3',
    primaryLight: '#e0e7ff',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    mastered: '#047857',
    masteredBg: '#ecfdf5',
    inProgress: '#b45309',
    inProgressBg: '#fffbeb',
    needsPractice: '#be123c',
    needsPracticeBg: '#fff1f2',
    accentGold: '#d97706',
  },
  spacing: {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
  },
  typography: {
    heading: 'Outfit',
    body: 'Plus Jakarta Sans',
  },
  a11y: {
    focusRingColor: '#6366f1',
    minTargetSize: 44,
  },
} as const;

export type UiLifecycleStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'error'
  | 'offline'
  | 'syncing'
  | 'conflict';

export interface UiLifecycleState<T = unknown> {
  status: UiLifecycleStatus;
  data?: T;
  error?: string;
  isBusy?: boolean;
}
