// Application constants
export const APP_NAME = 'DeepVariance'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Routes
export const ROUTES = {
  HOME: '/',
  MODELS: '/models',
  DATASETS: '/datasets',
} as const

// Theme colors
export const COLORS = {
  PRIMARY: '#6366F1',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#EF4444',
} as const
