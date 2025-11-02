/**
 * React Query hooks for dataset management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDatasets,
  getDataset,
  createDataset,
  updateDataset,
  updateDatasetName,
  deleteDataset,
  type DatasetsFilters,
} from '../api/datasets'

/**
 * Hook to fetch all datasets
 */
export const useDatasets = (filters?: DatasetsFilters) => {
  return useQuery({
    queryKey: ['datasets', filters],
    queryFn: () => getDatasets(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single dataset
 */
export const useDataset = (id: string) => {
  return useQuery({
    queryKey: ['datasets', id],
    queryFn: () => getDataset(id),
    enabled: !!id,
  })
}

/**
 * Hook to create/upload a dataset
 */
export const useCreateDataset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDataset,
    onSuccess: () => {
      // Invalidate and refetch datasets list
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}

/**
 * Hook to update dataset metadata
 */
export const useUpdateDataset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateDataset(id, updates),
    onSuccess: (_, variables) => {
      // Invalidate specific dataset and list
      queryClient.invalidateQueries({ queryKey: ['datasets', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}

/**
 * Hook to update dataset name
 */
export const useUpdateDatasetName = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateDatasetName(id, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['datasets', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}

/**
 * Hook to delete a dataset
 */
export const useDeleteDataset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDataset,
    onSuccess: () => {
      // Invalidate datasets list
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}
