/**
 * Model API Service
 * API calls for model management
 */
import { apiClient } from './client'

export interface Model {
  id: string
  name: string
  task: 'classification' | 'regression' | 'clustering' | 'detection'
  framework: string
  version: string
  status: 'active' | 'ready' | 'training' | 'queued' | 'draft' | 'failed'
  accuracy?: number
  created_at: string
  updated_at: string
  last_trained?: string
  dataset_id?: string
  model_path?: string
  tags: string[]
  description?: string
}

export interface ModelsFilters {
  task?: string
  status?: string
  search?: string
}

/**
 * Fetch all models with optional filters
 */
export const getModels = async (filters?: ModelsFilters): Promise<Model[]> => {
  const { data } = await apiClient.get<Model[]>('/models', {
    params: filters,
  })
  return data
}

/**
 * Get a single model by ID
 */
export const getModel = async (id: string): Promise<Model> => {
  const { data } = await apiClient.get<Model>(`/models/${id}`)
  return data
}

/**
 * Update model metadata
 */
export const updateModel = async (
  id: string,
  updates: {
    name?: string
    tags?: string[]
    description?: string
  }
): Promise<Model> => {
  const { data } = await apiClient.put<Model>(`/models/${id}`, updates)
  return data
}

/**
 * Update only model name
 */
export const updateModelName = async (id: string, name: string): Promise<Model> => {
  const { data } = await apiClient.patch<Model>(`/models/${id}/name`, null, {
    params: { name },
  })
  return data
}

/**
 * Delete a model
 */
export const deleteModel = async (id: string, deleteFiles = false): Promise<void> => {
  await apiClient.delete(`/models/${id}`, {
    params: { delete_files: deleteFiles },
  })
}

/**
 * Download model
 */
export const downloadModel = async (id: string): Promise<void> => {
  const { data } = await apiClient.get(`/models/${id}/download`)
  return data
}
