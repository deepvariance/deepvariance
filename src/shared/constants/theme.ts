/**
 * Shared theme constants for consistent styling across components
 */

export const DOMAIN_COLORS = {
  tabular: 'blue',
  vision: 'teal',
  text: 'purple',
  audio: 'grape',
} as const

export const READINESS_COLORS = {
  ready: 'green',
  profiling: 'orange',
  processing: 'yellow',
  draft: 'gray',
  error: 'red',
} as const

export const BADGE_STYLES = {
  domain: {
    root: {
      fontSize: '13px',
      fontWeight: 500,
      textTransform: 'none' as const,
      paddingLeft: 10,
      paddingRight: 10,
    },
  },
  readiness: {
    root: {
      fontSize: '13px',
      fontWeight: 500,
      textTransform: 'none' as const,
      paddingLeft: 10,
      paddingRight: 10,
    },
  },
  storage: {
    root: {
      fontSize: '11px',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      backgroundColor: '#F3F4F6',
      color: '#6B7280',
    },
  },
  tag: {
    root: {
      fontSize: '12px',
      fontWeight: 400,
      textTransform: 'none' as const,
      backgroundColor: '#F3F4F6',
      color: '#6B7280',
    },
  },
} as const

export const TABLE_STYLES = {
  th: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: '1px solid #E5E7EB',
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  td: {
    fontSize: '15px',
    borderBottom: '1px solid #F3F4F6',
    paddingTop: 16,
    paddingBottom: 16,
  },
  tr: {
    transition: 'background-color 0.15s ease',
  },
} as const
