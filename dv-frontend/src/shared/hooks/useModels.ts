/**
 * React Query hooks for model management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getModels,
  getModel,
  updateModel,
  updateModelName,
  deleteModel,
  downloadModel,
  type ModelsFilters,
} from '../api/models'

/**
 * Hook to fetch all models
 */
export const useModels = (filters?: ModelsFilters) => {
  return useQuery({
    queryKey: ['models', filters],
    queryFn: () => getModels(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10000, // Auto-refetch every 10 seconds to catch status updates
  })
}

/**
 * Hook to fetch a single model
 */
export const useModel = (id: string) => {
  return useQuery({
    queryKey: ['models', id],
    queryFn: () => getModel(id),
    enabled: !!id,
  })
}

/**
 * Hook to update model metadata
 */
export const useUpdateModel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateModel(id, updates),
    onSuccess: (_, variables) => {
      // Invalidate specific model and list
      queryClient.invalidateQueries({ queryKey: ['models', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })
}

/**
 * Hook to update model name
 */
export const useUpdateModelName = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateModelName(id, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['models', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })
}

/**
 * Hook to delete a model
 */
export const useDeleteModel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, deleteFiles }: { id: string; deleteFiles?: boolean }) =>
      deleteModel(id, deleteFiles),
    onSuccess: () => {
      // Invalidate models list
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })
}

/**
 * Hook to download a model
 */
export const useDownloadModel = () => {
  return useMutation({
    mutationFn: downloadModel,
  })
}
