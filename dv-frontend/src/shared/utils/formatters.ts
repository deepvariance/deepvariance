/**
 * Shared formatting utilities for consistent data display across the application
 */

export const formatters = {
  /**
   * Capitalize first letter of a string
   */
  capitalize: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1),

  /**
   * Format domain string (e.g., "vision" -> "Vision")
   */
  domain: (domain: string): string => formatters.capitalize(domain),

  /**
   * Format readiness state (e.g., "ready" -> "Ready")
   */
  readiness: (readiness: string): string => formatters.capitalize(readiness),

  /**
   * Format large numbers with K suffix (e.g., 1500 -> "1.5K")
   */
  number: (num: number): string =>
    num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString(),

  /**
   * Format date string to localized format
   */
  date: (dateString?: string, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateString) return 'N/A'

    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }

    return new Date(dateString).toLocaleDateString('en-US', options || defaultOptions)
  },

  /**
   * Format date with time
   */
  dateTime: (dateString?: string): string =>
    formatters.date(dateString, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),

  /**
   * Format storage type to uppercase
   */
  storage: (storage: string): string => storage.toUpperCase(),
} as const

/**
 * Standalone formatDate function for convenience
 */
export const formatDate = formatters.date
