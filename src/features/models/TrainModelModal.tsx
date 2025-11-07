import { useState, useMemo } from 'react'
import {
  Button,
  Modal,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Loader,
  Alert,
  Box,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconBolt, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useDatasets } from '@/shared/hooks/useDatasets'
import { DatasetSelector } from '@/shared/components'
import { formatters } from '@/shared/utils/formatters'
import { createTrainingJob } from '@/shared/api/jobs'
import type { DatasetOption } from '@/shared/types'

interface TrainModelModalProps {
  opened: boolean
  onClose: () => void
}

export function TrainModelModal({ opened, onClose }: TrainModelModalProps) {
  const queryClient = useQueryClient()
  const [modelName, setModelName] = useState('')
  const [selectedDataset, setSelectedDataset] = useState<string>('')
  const [task, setTask] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch datasets
  const { data: apiDatasets = [], isLoading, error } = useDatasets({ readiness: 'ready' })

  // Transform API datasets to DatasetOption format
  const datasets: DatasetOption[] = useMemo(() => {
    return apiDatasets.map((dataset) => ({
      value: dataset.id,
      label: dataset.name,
      domain: formatters.domain(dataset.domain),
      rows: `${dataset.size} files`,
      tags: dataset.tags || [],
      storage: formatters.storage(dataset.storage),
    }))
  }, [apiDatasets])

  const handleStartTraining = async () => {
    if (!task) return

    setIsSubmitting(true)
    try {
      await createTrainingJob({
        dataset_id: selectedDataset,
        model_name: modelName.trim() || undefined,
        task: task as 'classification' | 'regression' | 'clustering' | 'detection',
      })

      notifications.show({
        title: 'Training Job Queued',
        message: `Model "${modelName}" has been queued for training`,
        color: 'green',
        icon: <IconCheck size={16} />,
      })

      // Invalidate models cache to trigger immediate refresh
      queryClient.invalidateQueries({ queryKey: ['models'] })

      // Reset form and close modal
      setModelName('')
      setSelectedDataset('')
      setTask(null)
      onClose()
    } catch (error) {
      console.error('Failed to start training:', error)
      notifications.show({
        title: 'Failed to Start Training',
        message: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = modelName.trim() !== '' && selectedDataset !== '' && task !== null

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Train New Model"
      size="xl"
      centered
      styles={{
        title: {
          fontSize: '20px',
          fontWeight: 600,
        },
      }}
    >
      <Stack gap="lg">
        <Text size="15px" c="dimmed">
          Configure and start a new model training job
        </Text>

        {/* Model Name */}
        <div>
          <Text size="14px" fw={600} mb={8}>
            Model Name
          </Text>
          <TextInput
            placeholder="e.g., credit-risk-classifier"
            value={modelName}
            onChange={(e) => setModelName(e.currentTarget.value)}
            styles={{
              input: {
                fontSize: '15px',
              },
            }}
          />
          <Text size="13px" c="dimmed" mt={6}>
            Choose a descriptive name for your model
          </Text>
        </div>

        {/* Task Type */}
        <div>
          <Text size="14px" fw={600} mb={8}>
            Task Type
          </Text>
          <Select
            placeholder="Select task type"
            data={[
              { value: 'classification', label: 'Classification' },
              { value: 'regression', label: 'Regression' },
              { value: 'clustering', label: 'Clustering' },
              { value: 'detection', label: 'Object Detection' },
            ]}
            value={task}
            onChange={setTask}
            styles={{
              input: {
                fontSize: '15px',
              },
            }}
          />
          <Text size="13px" c="dimmed" mt={6}>
            Select the type of machine learning task
          </Text>
        </div>

        {/* Dataset Selection */}
        <div>
          <Text size="14px" fw={600} mb={8}>
            Training Dataset
          </Text>
          {isLoading ? (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 110,
                border: '1px solid #E5E7EB',
                borderRadius: 6,
              }}
            >
              <Loader size="sm" color="#FF5C4D" />
            </Box>
          ) : error ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error loading datasets"
              color="red"
              variant="light"
            >
              {error instanceof Error ? error.message : 'Failed to fetch datasets'}
            </Alert>
          ) : datasets.length === 0 ? (
            <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
              No ready datasets available. Please upload a dataset first.
            </Alert>
          ) : (
            <DatasetSelector
              datasets={datasets}
              value={selectedDataset}
              onChange={setSelectedDataset}
            />
          )}
          <Text size="13px" c="dimmed" mt={6}>
            Choose a dataset from your library
          </Text>
        </div>

        {/* Action Buttons */}
        <Group justify="flex-end" gap={12} mt="md">
          <Button
            variant="light"
            color="gray"
            onClick={onClose}
            disabled={isSubmitting}
            styles={{
              root: {
                fontSize: '15px',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            leftSection={!isSubmitting && <IconBolt size={18} />}
            color="orange"
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
            onClick={handleStartTraining}
            styles={{
              root: {
                backgroundColor: '#FF5C4D',
                fontSize: '15px',
              },
            }}
          >
            {isSubmitting ? 'Starting...' : 'Start Training'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
