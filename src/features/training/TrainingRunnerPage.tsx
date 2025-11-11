import {
  useCancelJob,
  useJobByModelId,
  useJobLogs,
} from '@/shared/hooks/useJobs'
import { useModel } from '@/shared/hooks/useModels'
import { useDataset } from '@/shared/hooks/useDatasets'
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Code,
  Divider,
  Group,
  Loader,
  Progress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconActivity,
  IconAlertCircle,
  IconArrowLeft,
  IconChartLine,
  IconDatabase,
  IconDownload,
  IconPlayerStop,
  IconRefresh,
  IconSettings,
  IconTerminal,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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

// Log type definition
interface TrainingLog {
  time?: string
  timestamp?: string
  level: string
  message: string
}

export function TrainingRunnerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string | null>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch model and job data
  const {
    data: model,
    isLoading: modelLoading,
    error: modelError,
  } = useModel(id!)
  const {
    data: job,
    isLoading: jobLoading,
    error: jobError,
  } = useJobByModelId(id)
  const { data: logsData } = useJobLogs(job?.id || '')
  const { data: dataset } = useDataset(job?.dataset_id || '')
  const cancelJobMutation = useCancelJob()

  const isLoading = modelLoading || jobLoading
  const error = modelError || jobError

  // Use real data from API
  const data =
    model && job
      ? {
          modelName: model.name,
          task: model.task,
          status: model.status,
          currentIteration: job.current_iteration ?? 0,
          totalIterations: job.total_iterations ?? 0,
          progress: job.progress ?? 0,
          currentLoss: job.current_loss ?? null,
          bestLoss: job.best_loss ?? null,
          accuracy: job.current_accuracy ? job.current_accuracy * 100 : null,
          validationAccuracy: job.best_accuracy
            ? job.best_accuracy * 100
            : null,
          precision: job.precision ? job.precision * 100 : null,
          recall: job.recall ? job.recall * 100 : null,
          f1Score: job.f1_score ? job.f1_score * 100 : null,
          learningRate: job.hyperparameters?.learning_rate ?? 0.001,
          batchSize: job.hyperparameters?.batch_size ?? 32,
          epochs: job.total_iterations ?? 10,
          optimizer: job.hyperparameters?.optimizer ?? 'Adam',
          dropoutRate: job.hyperparameters?.dropout_rate ?? 0.2,
          maxIterations: job.hyperparameters?.max_iterations ?? 10,
          targetAccuracy: job.hyperparameters?.target_accuracy ?? 1.0,
          elapsedTime: job.elapsed_time || '0s',
          estimatedRemaining: job.estimated_remaining || '0s',
          datasetName: model.tags.find(tag => tag !== model.task) || 'Unknown',
          datasetSize: dataset?.size ? `${dataset.size.toLocaleString()} samples` : 'N/A',
          hasRealData: true,
        }
      : {
          ...mockTrainingData,
          hasRealData: false,
        }

  // Parse logs data - the API returns { logs: [...] }
  const logs: TrainingLog[] = logsData?.logs || []

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
        message:
          error instanceof Error ? error.message : 'Failed to cancel job',
        color: 'red',
      })
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Stack gap={0} style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
        <Center h="100vh">
          <Loader size="lg" color="#6366F1" />
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
            {error instanceof Error
              ? error.message
              : 'Failed to fetch training data'}
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
                {data.task.charAt(0).toUpperCase() + data.task.slice(1)} •
                Dataset:
              </Text>
              <Text
                size="15px"
                c="blue"
                fw={500}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() =>
                  model?.dataset_id && navigate(`/datasets/${model.dataset_id}`)
                }
              >
                {data.datasetName}
              </Text>
            </Group>
          </div>

          {/* Action Buttons */}
          <Group gap={12}>
            <Tooltip
              label={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
            >
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
          <Card
            shadow="sm"
            padding="lg"
            radius={12}
            withBorder
            style={{ borderColor: '#E5E7EB' }}
          >
            <Stack gap={8}>
              <Text size="13px" c="dimmed" fw={500}>
                Progress
              </Text>
              <Text size="28px" fw={700}>
                {data.currentIteration}/{data.totalIterations}
              </Text>
              <Progress
                value={data.progress}
                size="md"
                color="blue"
                animated={job?.status === 'running'}
              />
              <Text size="12px" c="dimmed">
                {data.progress.toFixed(1)}% Complete
              </Text>
            </Stack>
          </Card>

          {/* Current Accuracy Card */}
          <Card
            shadow="sm"
            padding="lg"
            radius={12}
            withBorder
            style={{ borderColor: '#E5E7EB' }}
          >
            <Stack gap={8}>
              <Text size="13px" c="dimmed" fw={500}>
                Current Accuracy
              </Text>
              {data.accuracy !== null ? (
                <>
                  <Text size="28px" fw={700} c="blue">
                    {data.accuracy.toFixed(2)}%
                  </Text>
                  <Progress value={data.accuracy ?? 0} size="md" color="blue" />
                  <Text size="12px" c="dimmed">
                    Latest iteration
                  </Text>
                </>
              ) : (
                <>
                  <Text size="28px" fw={700} c="dimmed">
                    --
                  </Text>
                  <Text size="12px" c="dimmed">
                    No data yet
                  </Text>
                </>
              )}
            </Stack>
          </Card>

          {/* Best Accuracy Card */}
          <Card
            shadow="sm"
            padding="lg"
            radius={12}
            withBorder
            style={{ borderColor: '#E5E7EB' }}
          >
            <Stack gap={8}>
              <Text size="13px" c="dimmed" fw={500}>
                Best Accuracy
              </Text>
              {data.validationAccuracy !== null ? (
                <>
                  <Text size="28px" fw={700} c="green">
                    {data.validationAccuracy.toFixed(2)}%
                  </Text>
                  <Progress
                    value={data.validationAccuracy ?? 0}
                    size="md"
                    color="green"
                  />
                  <Text size="12px" c="dimmed">
                    All iterations
                  </Text>
                </>
              ) : (
                <>
                  <Text size="28px" fw={700} c="dimmed">
                    --
                  </Text>
                  <Text size="12px" c="dimmed">
                    No data yet
                  </Text>
                </>
              )}
            </Stack>
          </Card>

          {/* Time Card */}
          <Card
            shadow="sm"
            padding="lg"
            radius={12}
            withBorder
            style={{ borderColor: '#E5E7EB' }}
          >
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
            <Card
              shadow="sm"
              padding={0}
              radius={12}
              withBorder
              style={{ borderColor: '#E5E7EB' }}
            >
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
                          Live chart: Loss & Accuracy over iterations (Chart
                          visualization will be added)
                        </Text>
                      </Box>
                    </div>

                    {/* Performance Metrics Grid */}
                    <div>
                      <Text size="16px" fw={600} mb={16}>
                        Performance Metrics
                      </Text>
                      <SimpleGrid cols={4} spacing={16}>
                        <Card
                          padding="md"
                          radius={8}
                          style={{ backgroundColor: '#F9FAFB' }}
                        >
                          <Text size="13px" c="dimmed" mb={4}>
                            Current Accuracy
                          </Text>
                          <Text size="24px" fw={700} c="blue">
                            {data.accuracy !== null
                              ? `${data.accuracy.toFixed(2)}%`
                              : 'N/A'}
                          </Text>
                        </Card>
                        <Card
                          padding="md"
                          radius={8}
                          style={{ backgroundColor: '#F9FAFB' }}
                        >
                          <Text size="13px" c="dimmed" mb={4}>
                            Best Accuracy
                          </Text>
                          <Text size="24px" fw={700} c="green">
                            {data.validationAccuracy !== null
                              ? `${data.validationAccuracy.toFixed(2)}%`
                              : 'N/A'}
                          </Text>
                        </Card>
                        <Card
                          padding="md"
                          radius={8}
                          style={{ backgroundColor: '#F9FAFB' }}
                        >
                          <Text size="13px" c="dimmed" mb={4}>
                            Current Loss
                          </Text>
                          <Text size="24px" fw={700} c="orange">
                            {data.currentLoss !== null
                              ? data.currentLoss.toFixed(4)
                              : 'N/A'}
                          </Text>
                        </Card>
                        <Card
                          padding="md"
                          radius={8}
                          style={{ backgroundColor: '#F9FAFB' }}
                        >
                          <Text size="13px" c="dimmed" mb={4}>
                            Best Loss
                          </Text>
                          <Text size="24px" fw={700} c="teal">
                            {data.bestLoss !== null &&
                            data.bestLoss !== undefined
                              ? data.bestLoss.toFixed(4)
                              : 'N/A'}
                          </Text>
                        </Card>
                      </SimpleGrid>

                      <Text size="14px" fw={600} mt={24} mb={12}>
                        Classification Metrics
                      </Text>
                      <SimpleGrid cols={3} spacing={16}>
                        <Card
                          padding="md"
                          radius={8}
                          style={{ backgroundColor: '#F9FAFB' }}
                        >
                          <Text size="13px" c="dimmed" mb={4}>
                            Precision
                          </Text>
                          <Text size="24px" fw={700} c="violet">
                            {data.precision !== null
                              ? `${data.precision.toFixed(2)}%`
                              : 'N/A'}
                          </Text>
                        </Card>
                        <Card
                          padding="md"
                          radius={8}
                          style={{ backgroundColor: '#F9FAFB' }}
                        >
                          <Text size="13px" c="dimmed" mb={4}>
                            Recall
                          </Text>
                          <Text size="24px" fw={700} c="grape">
                            {data.recall !== null
                              ? `${data.recall.toFixed(2)}%`
                              : 'N/A'}
                          </Text>
                        </Card>
                        <Card
                          padding="md"
                          radius={8}
                          style={{ backgroundColor: '#F9FAFB' }}
                        >
                          <Text size="13px" c="dimmed" mb={4}>
                            F1-Score
                          </Text>
                          <Text size="24px" fw={700} c="indigo">
                            {data.f1Score !== null
                              ? `${data.f1Score.toFixed(2)}%`
                              : 'N/A'}
                          </Text>
                        </Card>
                      </SimpleGrid>

                      {data.precision === null &&
                        data.recall === null &&
                        data.f1Score === null && (
                          <Text
                            size="13px"
                            c="dimmed"
                            mt={12}
                            style={{ fontStyle: 'italic' }}
                          >
                            Classification metrics will appear here once
                            training begins.
                          </Text>
                        )}
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
                        Detailed metrics visualizations (Confusion Matrix, ROC
                        Curve, etc.)
                      </Text>
                    </Box>
                  </Stack>
                </Tabs.Panel>

                {/* Logs Tab */}
                <Tabs.Panel value="logs" p={0}>
                  <Box p={16} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <Group justify="space-between">
                      <Text size="14px" fw={600}>
                        Training Logs{' '}
                        {logs.length > 0 && `(${logs.length} lines)`}
                      </Text>
                      <Group gap={8}>
                        <Button
                          size="xs"
                          variant="light"
                          color="gray"
                          leftSection={<IconDownload size={14} />}
                          disabled={logs.length === 0}
                        >
                          Download
                        </Button>
                      </Group>
                    </Group>
                  </Box>
                  <ScrollArea h={500} style={{ backgroundColor: '#1e1e1e' }}>
                    <Box p={16}>
                      {logs.length > 0 ? (
                        logs.map((log: TrainingLog, index: number) => (
                          <Group
                            key={index}
                            gap={12}
                            mb={4}
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '13px',
                            }}
                          >
                            <Text c="gray.5" style={{ minWidth: 80 }}>
                              {log.time || log.timestamp || ''}
                            </Text>
                            <Badge
                              size="xs"
                              color={
                                log.level === 'WARNING'
                                  ? 'yellow'
                                  : log.level === 'ERROR'
                                    ? 'red'
                                    : log.level === 'INFO'
                                      ? 'blue'
                                      : 'gray'
                              }
                              variant="light"
                              style={{ minWidth: 60 }}
                            >
                              {log.level}
                            </Badge>
                            <Text c="gray.3">{log.message}</Text>
                          </Group>
                        ))
                      ) : (
                        <Center py={40}>
                          <Text c="gray.5" size="14px">
                            {job?.status === 'pending'
                              ? 'Waiting for training to start...'
                              : job?.status === 'running'
                                ? 'Loading logs...'
                                : 'No logs available for this training run'}
                          </Text>
                        </Center>
                      )}
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
                          {data.learningRate}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Batch Size
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {data.batchSize}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Epochs
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {data.epochs}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Optimizer
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {data.optimizer}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Dropout Rate
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {data.dropoutRate}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Max Iterations
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {data.maxIterations}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Target Accuracy
                        </Text>
                        <Code block p={8} style={{ fontSize: '14px' }}>
                          {data.targetAccuracy}
                        </Code>
                      </Box>
                      <Box>
                        <Text size="13px" c="dimmed" mb={4}>
                          Task
                        </Text>
                        <Code
                          block
                          p={8}
                          style={{
                            fontSize: '14px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {data.task}
                        </Code>
                      </Box>
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
                        onClick={() =>
                          model?.dataset_id &&
                          navigate(`/datasets/${model.dataset_id}`)
                        }
                        onMouseEnter={e => {
                          if (model?.dataset_id) {
                            e.currentTarget.style.backgroundColor = '#F3F4F6'
                          }
                        }}
                        onMouseLeave={e => {
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
