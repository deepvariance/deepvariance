import { useState } from 'react'
import {
  Box,
  Stack,
  Group,
  Title,
  Text,
  Badge,
  Button,
  Card,
  Progress,
  Tabs,
  SimpleGrid,
  Code,
  ScrollArea,
  Divider,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconPlayerPause,
  IconPlayerStop,
  IconDownload,
  IconRefresh,
  IconActivity,
  IconChartLine,
  IconTerminal,
  IconSettings,
  IconDatabase,
} from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/shared/config/constants'
import { useModel } from '@/shared/hooks/useModels'
import { useJobByModelId, useJobLogs, useCancelJob } from '@/shared/hooks/useJobs'
import { Loader, Center, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

// Mock data - will be replaced with real API calls
const mockTrainingData = {
  modelName: 'credit-risk-classifier',
  task: 'classification',
  status: 'training',
  currentIteration: 15,
  totalIterations: 50,
  progress: 30,
  currentLoss: 0.234,
  lossDelta: -0.012,
  accuracy: 94.2,
  validationAccuracy: 92.8,
  precision: 92.1,
  recall: 95.3,
  f1Score: 93.7,
  learningRate: 0.001,
  batchSize: 32,
  elapsedTime: '14m 32s',
  estimatedRemaining: '34m 8s',
  datasetName: 'credit-default-2023',
  datasetSize: '125,000 samples',
}

const mockLogs = [
  { time: '14:32:15', level: 'INFO', message: 'Iteration 15/50 started' },
  { time: '14:32:16', level: 'INFO', message: 'Batch 1/128 - loss: 0.245, accuracy: 0.938' },
  { time: '14:32:17', level: 'INFO', message: 'Batch 2/128 - loss: 0.231, accuracy: 0.941' },
  { time: '14:32:18', level: 'INFO', message: 'Batch 3/128 - loss: 0.238, accuracy: 0.945' },
  { time: '14:32:19', level: 'INFO', message: 'Batch 4/128 - loss: 0.229, accuracy: 0.943' },
  { time: '14:32:20', level: 'WARNING', message: 'Learning rate adjusted: 0.001 -> 0.0008' },
  { time: '14:32:21', level: 'INFO', message: 'Batch 5/128 - loss: 0.227, accuracy: 0.946' },
  { time: '14:32:22', level: 'INFO', message: 'Batch 6/128 - loss: 0.233, accuracy: 0.944' },
]

const mockSystemResources = {
  cpu: { usage: 45, temp: 51 },
  gpu: { usage: 68, temp: 71, memory: '8.7 / 16 GB' },
  ram: { usage: 28, used: '16.2 / 16 GB' },
}

export function TrainingRunnerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string | null>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch model and job data
  const { data: model, isLoading: modelLoading, error: modelError } = useModel(id!)
  const { data: job, isLoading: jobLoading, error: jobError } = useJobByModelId(id)
  const { data: logsData } = useJobLogs(job?.id || '')
  const cancelJobMutation = useCancelJob()

  const isLoading = modelLoading || jobLoading
  const error = modelError || jobError

  // Use real data if available, otherwise mock data
  const data = model && job ? {
    modelName: model.name,
    task: model.task,
    status: model.status,
    currentIteration: job.current_iteration || 0,
    totalIterations: job.total_iterations || 0,
    progress: job.total_iterations ? (job.current_iteration / job.total_iterations) * 100 : 0,
    currentLoss: 0, // Not available in current API
    lossDelta: 0, // Not available in current API
    accuracy: job.current_accuracy ? job.current_accuracy * 100 : 0,
    validationAccuracy: job.best_accuracy ? job.best_accuracy * 100 : 0,
    precision: 0, // Not available in current API
    recall: 0, // Not available in current API
    f1Score: 0, // Not available in current API
    learningRate: job.hyperparameters?.learning_rate || 0.001,
    batchSize: job.hyperparameters?.batch_size || 32,
    elapsedTime: job.elapsed_time || '0s',
    estimatedRemaining: job.estimated_remaining || '0s',
    datasetName: model.tags.find(tag => tag !== model.task) || 'Unknown',
    datasetSize: '0 samples', // Not available in current API
  } : mockTrainingData

  // Parse logs data
  const logs = logsData?.logs || mockLogs
  const resources = mockSystemResources

  // Handle cancel job
  const handleCancelJob = async () => {
    if (!job?.id) return

    try {
      await cancelJobMutation.mutateAsync(job.id)
      notifications.show({
        title: 'Job Cancelled',
        message: 'Training job has been cancelled successfully',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Cancel Failed',
        message: error instanceof Error ? error.message : 'Failed to cancel job',
        color: 'red',
      })
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Stack gap={0} style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
        <Center h="100vh">
          <Loader size="lg" color="#FF5C4D" />
        </Center>
      </Stack>
    )
  }

  // Show error state
  if (error) {
    return (
      <Stack gap={0} style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
        <Box px={32} pt={40}>
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error loading training data"
            color="red"
            variant="light"
          >
            {error instanceof Error ? error.message : 'Failed to fetch training data'}
          </Alert>
          <Button
            mt={16}
            variant="light"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/models')}
          >
            Back to Models
          </Button>
        </Box>
      </Stack>
    )
  }

  return (
    <Stack gap={0} style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Header Section */}
      <Box px={32} pt={40} pb={24}>
        <Group gap={16} mb={20}>
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(`/models/${id}?tab=history`)}
            styles={{
              root: {
                fontSize: '14px',
                fontWeight: 500,
                color: '#6B7280',
                paddingLeft: 8,
                paddingRight: 12,
              },
            }}
          >
            Back to Model
          </Button>
        </Group>

        {/* Training Header */}
        <Group justify="space-between" align="flex-start" mb={24}>
          <div>
            <Group gap={12} mb={8}>
              <Title order={1} size={32} fw={700}>
                {data.modelName}
              </Title>
              <Badge
                variant="light"
                color="blue"
                size="lg"
                styles={{
                  root: {
                    fontSize: '13px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  },
                }}
              >
                {data.status}
              </Badge>
            </Group>
            <Group gap={6}>
              <Text size="15px" c="dimmed">
                {data.task.charAt(0).toUpperCase() + data.task.slice(1)} • Dataset:
              </Text>
              <Text
                size="15px"
                c="blue"
                fw={500}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => model?.dataset_id && navigate(`/datasets/${model.dataset_id}`)}
              >
                {data.datasetName}
              </Text>
            </Group>
          </div>

          {/* Action Buttons */}
          <Group gap={12}>
            <Tooltip label={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}>
              <ActionIcon
                size="lg"
                variant={autoRefresh ? 'filled' : 'light'}
                color="blue"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            {job && (job.status === 'pending' || job.status === 'running') && (
              <Button
                variant="light"
                color="red"
                leftSection={<IconPlayerStop size={16} />}
                styles={{ root: { fontSize: '14px' } }}
                onClick={handleCancelJob}
                loading={cancelJobMutation.isPending}
              >
                Stop Training
              </Button>
            )}
          </Group>
        </Group>

        {/* Status Cards */}
        <SimpleGrid cols={4} spacing={16}>
          {/* Progress Card */}
          <Card shadow="sm" padding="lg" radius={12} withBorder style={{ borderColor: '#E5E7EB' }}>
            <Stack gap={8}>
              <Text size="13px" c="dimmed" fw={500}>
                Progress
              </Text>
              <Text size="28px" fw={700}>
                Iteration {data.currentIteration}/{data.totalIterations}
              </Text>
              <Progress value={data.progress} size="md" color="blue" animated />
              <Text size="12px" c="dimmed">
                {data.progress.toFixed(1)}% Complete
              </Text>
            </Stack>
          </Card>

          {/* Loss Card */}
          <Card shadow="sm" padding="lg" radius={12} withBorder style={{ borderColor: '#E5E7EB' }}>
            <Stack gap={8}>
              <Text size="13px" c="dimmed" fw={500}>
                Training Loss
              </Text>
              <Group gap={8} align="baseline">
                <Text size="28px" fw={700}>
                  {data.currentLoss.toFixed(3)}
                </Text>
                <Badge
                  variant="light"
                  color={data.lossDelta < 0 ? 'green' : 'red'}
                  size="sm"
                  styles={{ root: { fontSize: '11px' } }}
                >
                  {data.lossDelta > 0 ? '+' : ''}{data.lossDelta.toFixed(3)}
                </Badge>
              </Group>
              <Text size="12px" c="dimmed">
                vs. last iteration
              </Text>
            </Stack>
          </Card>

          {/* Accuracy Card */}
          <Card shadow="sm" padding="lg" radius={12} withBorder style={{ borderColor: '#E5E7EB' }}>
            <Stack gap={8}>
              <Text size="13px" c="dimmed" fw={500}>
                Accuracy
              </Text>
              <Text size="28px" fw={700} c="green">
                {data.accuracy}%
              </Text>
              <Progress value={data.accuracy} size="md" color="green" />
              <Text size="12px" c="dimmed">
                Validation: {data.validationAccuracy}%
              </Text>
            </Stack>
          </Card>

          {/* Time Card */}
          <Card shadow="sm" padding="lg" radius={12} withBorder style={{ borderColor: '#E5E7EB' }}>
            <Stack gap={8}>
              <Text size="13px" c="dimmed" fw={500}>
                Time
              </Text>
              <Text size="28px" fw={700}>
                {data.elapsedTime}
              </Text>
              <Text size="12px" c="dimmed" fw={500}>
                Remaining: {data.estimatedRemaining}
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Main Content */}
      <Box px={32} pb={32}>
        <Group align="flex-start" gap={24}>
          {/* Main Tabs Area */}
          <Box style={{ flex: 1 }}>
            <Card shadow="sm" padding={0} radius={12} withBorder style={{ borderColor: '#E5E7EB' }}>
              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List
                  style={{
                    borderBottom: '1px solid #E5E7EB',
                    paddingLeft: 24,
                    paddingRight: 24,
                  }}
                >
                  <Tabs.Tab
                    value="overview"
                    leftSection={<IconActivity size={16} />}
                    styles={{
                      tab: {
                        fontSize: '14px',
                        fontWeight: 500,
                        paddingTop: 16,
                        paddingBottom: 16,
                      },
                    }}
                  >
                    Overview
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="metrics"
                    leftSection={<IconChartLine size={16} />}
                    styles={{
                      tab: {
                        fontSize: '14px',
                        fontWeight: 500,
                        paddingTop: 16,
                        paddingBottom: 16,
                      },
                    }}
                  >
                    Metrics
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="logs"
                    leftSection={<IconTerminal size={16} />}
                    styles={{
                      tab: {
                        fontSize: '14px',
                        fontWeight: 500,
                        paddingTop: 16,
                        paddingBottom: 16,
                      },
                    }}
                  >
                    Logs
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="hyperparameters"
                    leftSection={<IconSettings size={16} />}
                    styles={{
                      tab: {
                        fontSize: '14px',
                        fontWeight: 500,
                        paddingTop: 16,
                        paddingBottom: 16,
                      },
                    }}
                  >
                    Hyperparameters
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="dataset"
                    leftSection={<IconDatabase size={16} />}
                    styles={{
                      tab: {
                        fontSize: '14px',
                        fontWeight: 500,
                        paddingTop: 16,
                        paddingBottom: 16,
                      },
                    }}
                  >
                    Dataset
                  </Tabs.Tab>
                </Tabs.List>

                {/* Overview Tab */}
                <Tabs.Panel value="overview" p={24}>
                  <Stack gap={24}>
                    {/* Training Curves */}
                    <div>
                      <Text size="16px" fw={600} mb={16}>
                        Training Curves
                      </Text>
                      <Box
                        p={32}
                        style={{
                          backgroundColor: '#F9FAFB',
                          borderRadius: 8,
                          border: '1px solid #E5E7EB',
                          minHeight: 300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text c="dimmed" size="15px">
                          Live chart: Loss & Accuracy over iterations (Chart visualization will be added)
                        </Text>
                      </Box>
                    </div>

                    {/* Performance Metrics Grid */}
                    <div>
                      <Text size="16px" fw={600} mb={16}>
                        Performance Metrics
                      </Text>
                      <SimpleGrid cols={4} spacing={16}>
                        <Card padding="md" radius={8} style={{ backgroundColor: '#F9FAFB' }}>
                          <Text size="13px" c="dimmed" mb={4}>
                            Accuracy
                          </Text>
                          <Text size="24px" fw={700} c="green">
                            {data.accuracy}%
                          </Text>
                        </Card>
                        <Card padding="md" radius={8} style={{ backgroundColor: '#F9FAFB' }}>
                          <Text size="13px" c="dimmed" mb={4}>
                            Precision
                          </Text>
                          <Text size="24px" fw={700} c="blue">
                            {data.precision}%
                          </Text>
                        </Card>
                        <Card padding="md" radius={8} style={{ backgroundColor: '#F9FAFB' }}>
                          <Text size="13px" c="dimmed" mb={4}>
                            Recall
                          </Text>
                          <Text size="24px" fw={700} c="purple">
                            {data.recall}%
                          </Text>
                        </Card>
                        <Card padding="md" radius={8} style={{ backgroundColor: '#F9FAFB' }}>
                          <Text size="13px" c="dimmed" mb={4}>
                            F1-Score
                          </Text>
                          <Text size="24px" fw={700} c="orange">
                            {data.f1Score}%
                          </Text>
                        </Card>
                      </SimpleGrid>
                    </div>
                  </Stack>
                </Tabs.Panel>

                {/* Metrics Tab */}
                <Tabs.Panel value="metrics" p={24}>
                  <Stack gap={24}>
                    <Text size="16px" fw={600}>
                      Detailed Metrics Analysis
                    </Text>
                    <Box
                      p={32}
                      style={{
                        backgroundColor: '#F9FAFB',
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        minHeight: 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text c="dimmed" size="15px">
                        Detailed metrics visualizations (Confusion Matrix, ROC Curve, etc.)
                      </Text>
                    </Box>
                  </Stack>
                </Tabs.Panel>

                {/* Logs Tab */}
                <Tabs.Panel value="logs" p={0}>
                  <Box p={16} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <Group justify="space-between">
                      <Text size="14px" fw={600}>
                        Training Logs
                      </Text>
                      <Group gap={8}>
                        <Button
                          size="xs"
                          variant="light"
                          color="gray"
                          leftSection={<IconDownload size={14} />}
                        >
                          Download
                        </Button>
                      </Group>
                    </Group>
                  </Box>
                  <ScrollArea h={500} style={{ backgroundColor: '#1e1e1e' }}>
                    <Box p={16}>
                      {logs.map((log, index) => (
                        <Group
                          key={index}
                          gap={12}
                          mb={4}
                          style={{ fontFamily: 'monospace', fontSize: '13px' }}
                        >
                          <Text c="gray.5" style={{ minWidth: 80 }}>
                            {log.time}
                          </Text>
                          <Badge
                            size="xs"
                            color={log.level === 'WARNING' ? 'yellow' : log.level === 'ERROR' ? 'red' : 'blue'}
                            variant="light"
                            style={{ minWidth: 60 }}
                          >
                            {log.level}
                          </Badge>
                          <Text c="gray.3">{log.message}</Text>
                        </Group>
                      ))}
                    </Box>
                  </ScrollArea>
                </Tabs.Panel>

                {/* Hyperparameters Tab */}
                <Tabs.Panel value="hyperparameters" p={24}>
                  <Stack gap={24}>
                    <Text size="16px" fw={600}>
                      Training Configuration
                    </Text>
                    <SimpleGrid cols={2} spacing={16}>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Learning Rate
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {job?.hyperparameters?.learning_rate ?? data.learningRate}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Batch Size
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {job?.hyperparameters?.batch_size ?? data.batchSize}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Max Iterations
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {job?.hyperparameters?.max_iterations ?? data.totalIterations}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Optimizer
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {job?.hyperparameters?.optimizer ?? 'Adam'}
                        </Code>
                      </Box>
                      {job?.hyperparameters?.dropout_rate !== undefined && (
                        <Box>
                          <Text size="13px" c="dimmed" mb={4}>
                            Dropout Rate
                          </Text>
                          <Code block p={8} style={{ fontSize: '14px' }}>
                            {job.hyperparameters.dropout_rate}
                          </Code>
                        </Box>
                      )}
                      {job?.hyperparameters?.target_accuracy !== undefined && (
                        <Box>
                          <Text size="13px" c="dimmed" mb={4}>
                            Target Accuracy
                          </Text>
                          <Code block p={8} style={{ fontSize: '14px' }}>
                            {job.hyperparameters.target_accuracy}
                          </Code>
                        </Box>
                      )}
                    </SimpleGrid>
                  </Stack>
                </Tabs.Panel>

                {/* Dataset Tab */}
                <Tabs.Panel value="dataset" p={24}>
                  <Stack gap={24}>
                    <div>
                      <Text size="16px" fw={600} mb={16}>
                        Dataset Information
                      </Text>
                      <Card
                        padding="lg"
                        radius={8}
                        style={{
                          backgroundColor: '#F9FAFB',
                          cursor: model?.dataset_id ? 'pointer' : 'default',
                          transition: 'background-color 0.2s ease',
                        }}
                        onClick={() => model?.dataset_id && navigate(`/datasets/${model.dataset_id}`)}
                        onMouseEnter={(e) => {
                          if (model?.dataset_id) {
                            e.currentTarget.style.backgroundColor = '#F3F4F6'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F9FAFB'
                        }}
                      >
                        <Stack gap={12}>
                          <Group justify="space-between">
                            <Text size="14px" c="dimmed">
                              Dataset Name
                            </Text>
                            <Group gap={8}>
                              <Text size="14px" fw={500} c="blue">
                                {data.datasetName}
                              </Text>
                              <Text size="12px" c="dimmed">
                                (click to view)
                              </Text>
                            </Group>
                          </Group>
                          <Divider />
                          <Group justify="space-between">
                            <Text size="14px" c="dimmed">
                              Total Samples
                            </Text>
                            <Text size="14px" fw={500}>
                              {data.datasetSize}
                            </Text>
                          </Group>
                          <Divider />
                          <Group justify="space-between">
                            <Text size="14px" c="dimmed">
                              Train / Validation Split
                            </Text>
                            <Text size="14px" fw={500}>
                              80% / 20%
                            </Text>
                          </Group>
                        </Stack>
                      </Card>
                    </div>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Card>
          </Box>

          {/* Right Sidebar - Quick Actions */}
          <Box style={{ width: 280 }}>
            <Card
              shadow="sm"
              padding="lg"
              radius={12}
              withBorder
              style={{ borderColor: '#E5E7EB' }}
            >
              <Stack gap={12}>
                <Text size="14px" fw={600} mb={8}>
                  Quick Actions
                </Text>
                <Button
                  fullWidth
                  variant="light"
                  color="blue"
                  leftSection={<IconDownload size={16} />}
                  styles={{ root: { fontSize: '14px' } }}
                >
                  Export Checkpoints
                </Button>
                <Button
                  fullWidth
                  variant="light"
                  color="gray"
                  leftSection={<IconSettings size={16} />}
                  styles={{ root: { fontSize: '14px' } }}
                >
                  Adjust Settings
                </Button>
              </Stack>
            </Card>
          </Box>
        </Group>
      </Box>
    </Stack>
  )
}
