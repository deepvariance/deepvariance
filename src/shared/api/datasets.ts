/**
 * Dataset API Service
 * API calls for dataset management
 */
import { apiClient } from './client'

export interface Dataset {
  id: string
  name: string
  domain: 'tabular' | 'vision' | 'text' | 'audio'
  size: number // Number of files
  readiness: 'ready' | 'profiling' | 'processing' | 'draft' | 'error'
  storage: 'local' | 'gcs' | 's3'
  path: string
  tags: string[]
  description?: string
  created_at: string
  updated_at: string
  last_modified?: string
  freshness?: string
}

export interface DatasetsFilters {
  domain?: string
  readiness?: string
  search?: string
}

/**
 * Fetch all datasets with optional filters
 */
export const getDatasets = async (filters?: DatasetsFilters): Promise<Dataset[]> => {
  const { data } = await apiClient.get<Dataset[]>('/datasets', {
    params: filters,
  })
  return data
}

/**
 * Get a single dataset by ID
 */
export const getDataset = async (id: string): Promise<Dataset> => {
  const { data } = await apiClient.get<Dataset>(`/datasets/${id}`)
  return data
}

/**
 * Create/upload a new dataset
 */
export const createDataset = async (
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<Dataset> => {
  const { data } = await apiClient.post<Dataset>('/datasets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
    timeout: 600000, // 10 minutes for large files
  })
  return data
}

/**
 * Update dataset metadata
 */
export const updateDataset = async (
  id: string,
  updates: {
    name?: string
    tags?: string[]
    description?: string
    readiness?: string
  }
): Promise<Dataset> => {
  const { data } = await apiClient.put<Dataset>(`/datasets/${id}`, updates)
  return data
}

/**
 * Update only dataset name
 */
export const updateDatasetName = async (id: string, name: string): Promise<Dataset> => {
  const { data } = await apiClient.patch<Dataset>(`/datasets/${id}/name`, null, {
    params: { name },
  })
  return data
}

/**
 * Delete a dataset (includes files)
 */
export const deleteDataset = async (id: string): Promise<void> => {
  await apiClient.delete(`/datasets/${id}`)
}
