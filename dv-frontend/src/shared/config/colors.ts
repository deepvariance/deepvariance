/**
 * Color constants used throughout the application
 * Maintains consistency with the DeepVariance indigo theme
 */

export const COLORS = {
  // Primary brand colors
  PRIMARY: '#6366F1',
  PRIMARY_LIGHT: '#EEF2FF',
  PRIMARY_HOVER: '#E0E7FF',

  // Neutral colors
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_700: '#374151',

  // Status colors
  SUCCESS: '#22C55E',
  SUCCESS_LIGHT: '#D4F4DD',
  WARNING: '#F97316',

  // Text colors
  TEXT_PRIMARY: '#374151',
  TEXT_SECONDARY: '#6B7280',
  TEXT_MUTED: '#9CA3AF',
} as const

export const BADGE_STYLES = {
  gcsLabel: {
    root: {
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      fontWeight: 500,
    },
  },
  tag: {
    root: {
      fontSize: '11px',
      fontWeight: 400,
      backgroundColor: COLORS.GRAY_100,
      color: COLORS.GRAY_500,
    },
  },
} as const
