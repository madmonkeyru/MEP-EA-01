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
    danger: '#ef4444',
    dangerBg: '#fef2f2',
    warning: '#f59e0b',
    warningBg: '#fffbeb',
  },
  spacing: {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    heading: 'Outfit',
    body: 'Plus Jakarta Sans',
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  a11y: {
    focusRingColor: '#6366f1',
    minTargetSize: 44,
  },
} as const;

/**
 * P13 Formalized UI Lifecycle States
 * Enforces explicit surface transitions across Web and Mobile
 */
export type UiLifecycleStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'active'
  | 'submitting'
  | 'empty'
  | 'offline'
  | 'syncing'
  | 'conflict'
  | 'recoverable-error'
  | 'fatal-error'
  | 'error';

export interface UiLifecycleState<T = unknown> {
  status: UiLifecycleStatus;
  data?: T;
  error?: string;
  isBusy?: boolean;
}

export function createIdleLifecycleState<T>(): UiLifecycleState<T> {
  return { status: 'idle' };
}

export function createLoadingLifecycleState<T>(previousData?: T): UiLifecycleState<T> {
  return { status: 'loading', data: previousData, isBusy: true };
}

export function createReadyLifecycleState<T>(data: T): UiLifecycleState<T> {
  return { status: 'ready', data, isBusy: false };
}

export function createEmptyLifecycleState<T>(): UiLifecycleState<T> {
  return { status: 'empty', isBusy: false };
}

export function createErrorLifecycleState<T>(error: string, isFatal = false, previousData?: T): UiLifecycleState<T> {
  return {
    status: isFatal ? 'fatal-error' : 'recoverable-error',
    error,
    data: previousData,
    isBusy: false,
  };
}
