import { useState, useEffect } from 'react'
import {
  Box,
  Stack,
  Group,
  Title,
  Text,
  Badge,
  Button,
  Tabs,
  Card,
  Divider,
  Loader,
  Center,
  Alert,
  Textarea,
  Table,
  Code,
  ActionIcon,
  CopyButton,
  Tooltip,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconDownload,
  IconRocket,
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconChartBar,
  IconHistory,
  IconCircleCheck,
  IconCircleX,
  IconCircleMinus,
  IconClock,
  IconEdit,
  IconX,
} from '@tabler/icons-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useModel } from '@/shared/hooks/useModels'
import { useDataset } from '@/shared/hooks/useDatasets'
import { formatDate } from '@/shared/utils/formatters'
import { ROUTES, COLORS } from '@/shared/config/constants'

const taskColors: Record<string, string> = {
  classification: 'blue',
  regression: 'purple',
  clustering: 'teal',
  detection: 'grape',
}

const statusColors: Record<string, string> = {
  active: 'green',
  ready: 'green',
  training: 'blue',
  queued: 'cyan',
  draft: 'orange',
  failed: 'red',
}

export function ModelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<string | null>('overview')
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [summaryValue, setSummaryValue] = useState('')

  // Fetch model data
  const { data: model, isLoading, error } = useModel(id || '')

  // Fetch dataset data if model has a dataset_id
  const { data: dataset } = useDataset(model?.dataset_id || '')

  // Set active tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Initialize summary value when model loads
  useEffect(() => {
    if (model?.description) {
      setSummaryValue(model.description)
    }
  }, [model?.description])

  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" color={COLORS.PRIMARY} />
      </Center>
    )
  }

  if (error || !model) {
    return (
      <Box p={32}>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error loading model"
          color="red"
          variant="light"
        >
          {error instanceof Error ? error.message : 'Model not found'}
        </Alert>
      </Box>
    )
  }

  return (
    <Stack gap={0} style={{ height: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Header Section */}
      <Box px={32} pt={40} pb={24}>
        <Group gap={16} mb={20}>
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(ROUTES.MODELS)}
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
            Back to Models
          </Button>
        </Group>

        {/* Model Header */}
        <Group justify="space-between" align="flex-start" mb={16}>
          <div>
            <Group gap={12} mb={8}>
              <Title order={1} size={32} fw={700}>
                {model.name}
              </Title>
              <Badge
                variant="light"
                color={taskColors[model.task] || 'gray'}
                styles={{
                  root: {
                    fontSize: '13px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    paddingLeft: 10,
                    paddingRight: 10,
                  },
                }}
              >
                {model.task}
              </Badge>
              <Badge
                variant={model.status === 'ready' || model.status === 'active' ? 'light' : 'outline'}
                color={statusColors[model.status] || 'gray'}
                styles={{
                  root: {
                    fontSize: '13px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    paddingLeft: 10,
                    paddingRight: 10,
                  },
                }}
              >
                {model.status}
              </Badge>
            </Group>
            <Text size="15px" c="dimmed">
              {model.description || 'No description provided'}
            </Text>
          </div>

          <Group gap={12}>
            {(model.status === 'training' || model.status === 'queued') && (
              <Button
                variant="light"
                color="blue"
                leftSection={<IconChartBar size={18} />}
                onClick={() => navigate(`/models/${model.id}/training`)}
                styles={{
                  root: {
                    fontSize: '15px',
                    fontWeight: 500,
                  },
                }}
              >
                View Training
              </Button>
            )}
            <Button
              variant="light"
              color="orange"
              leftSection={<IconDownload size={18} />}
              styles={{
                root: {
                  fontSize: '15px',
                  fontWeight: 500,
                },
              }}
            >
              Download
            </Button>
            <Button
              color="orange"
              leftSection={<IconRocket size={18} />}
              styles={{
                root: {
                  backgroundColor: COLORS.PRIMARY,
                  fontSize: '15px',
                  fontWeight: 500,
                },
              }}
            >
              Deploy
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Tabs Section */}
      <Box px={32} style={{ flex: 1, overflow: 'auto' }}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List
            styles={{
              list: {
                borderBottom: '1px solid #E5E7EB',
              },
              tab: {
                fontSize: '15px',
                fontWeight: 500,
                padding: '12px 20px',
                '&[data-active]': {
                  borderBottomColor: COLORS.PRIMARY,
                },
              },
            }}
          >
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="evaluations">Evaluations</Tabs.Tab>
            <Tabs.Tab value="api">API Usage</Tabs.Tab>
            <Tabs.Tab value="versions">Versions</Tabs.Tab>
            <Tabs.Tab value="history">Training History</Tabs.Tab>
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Panel value="overview" pt={24} pb={32}>
            <Stack gap={24}>
              {/* Summary Card */}
              <Card
                shadow="none"
                padding={24}
                radius={12}
                withBorder
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: 'white',
                }}
              >
                <Group justify="space-between" mb={16}>
                  <Text size="16px" fw={600}>
                    Summary
                  </Text>
                  {!isEditingSummary && (
                    <Button
                      variant="subtle"
                      color="gray"
                      size="sm"
                      leftSection={<IconEdit size={16} />}
                      onClick={() => setIsEditingSummary(true)}
                      styles={{
                        root: {
                          fontSize: '14px',
                        },
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </Group>

                {isEditingSummary ? (
                  <>
                    <Textarea
                      placeholder="Add a summary describing this model..."
                      value={summaryValue}
                      onChange={(e) => setSummaryValue(e.currentTarget.value)}
                      minRows={4}
                      autoFocus
                      styles={{
                        input: {
                          fontSize: '15px',
                          borderColor: '#E5E7EB',
                        },
                      }}
                    />
                    <Group justify="flex-end" mt={12} gap={8}>
                      <Button
                        variant="subtle"
                        color="gray"
                        size="sm"
                        leftSection={<IconX size={16} />}
                        onClick={() => {
                          setSummaryValue(model.description || '')
                          setIsEditingSummary(false)
                        }}
                        styles={{
                          root: {
                            fontSize: '14px',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="light"
                        color="orange"
                        size="sm"
                        leftSection={<IconCheck size={16} />}
                        onClick={() => {
                          // TODO: Call API to update model description
                          setIsEditingSummary(false)
                        }}
                        styles={{
                          root: {
                            fontSize: '14px',
                          },
                        }}
                      >
                        Save
                      </Button>
                    </Group>
                  </>
                ) : (
                  <Text size="15px" c={summaryValue ? 'dark' : 'dimmed'}>
                    {summaryValue || 'No description provided. Click Edit to add one.'}
                  </Text>
                )}
              </Card>

              {/* Model Details Grid */}
              <Group align="flex-start" gap={24} style={{ alignItems: 'stretch' }}>
                {/* Model Information */}
                <Card
                  shadow="none"
                  padding={24}
                  radius={12}
                  withBorder
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: 'white',
                    flex: 1,
                  }}
                >
                  <Text size="16px" fw={600} mb={16}>
                    Model Information
                  </Text>
                  <Stack gap={12}>
                    <Box>
                      <Text size="13px" c="dimmed" mb={4}>
                        Framework
                      </Text>
                      <Text size="15px" fw={500}>
                        {model.framework}
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text size="13px" c="dimmed" mb={4}>
                        Version
                      </Text>
                      <Code
                        style={{
                          fontSize: '14px',
                          padding: '4px 8px',
                        }}
                      >
                        {model.version}
                      </Code>
                    </Box>
                    <Divider />
                    <Box>
                      <Text size="13px" c="dimmed" mb={4}>
                        Task Type
                      </Text>
                      <Text size="15px" fw={500} tt="capitalize">
                        {model.task}
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text size="13px" c="dimmed" mb={4}>
                        Accuracy
                      </Text>
                      <Text size="15px" fw={500}>
                        {model.accuracy ? `${model.accuracy.toFixed(2)}%` : 'N/A'}
                      </Text>
                    </Box>
                  </Stack>
                </Card>

                {/* Training Details */}
                <Card
                  shadow="none"
                  padding={24}
                  radius={12}
                  withBorder
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: 'white',
                    flex: 1,
                  }}
                >
                  <Text size="16px" fw={600} mb={16}>
                    Training Details
                  </Text>
                  <Stack gap={12}>
                    <Box>
                      <Text size="13px" c="dimmed" mb={4}>
                        Training Dataset
                      </Text>
                      <Group gap={8}>
                        <Text
                          size="15px"
                          fw={500}
                          style={{ color: COLORS.PRIMARY, cursor: 'pointer' }}
                          onClick={() => {
                            if (model.dataset_id) {
                              navigate(`/datasets/${model.dataset_id}`)
                            }
                          }}
                        >
                          {dataset?.name || model.dataset_id || 'Not linked'}
                        </Text>
                        {model.dataset_id && (
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="orange"
                            onClick={() => navigate(`/datasets/${model.dataset_id}`)}
                          >
                            <IconExternalLink size={14} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Box>
                    <Divider />
                    <Box>
                      <Text size="13px" c="dimmed" mb={4}>
                        Created At
                      </Text>
                      <Text size="15px" fw={500}>
                        {formatDate(model.created_at)}
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text size="13px" c="dimmed" mb={4}>
                        Last Trained
                      </Text>
                      <Text size="15px" fw={500}>
                        {model.last_trained ? formatDate(model.last_trained) : 'Never'}
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text size="13px" c="dimmed" mb={4}>
                        Model Path
                      </Text>
                      <Code
                        style={{
                          fontSize: '13px',
                          padding: '4px 8px',
                          wordBreak: 'break-all',
                        }}
                      >
                        {model.model_path || 'Not available'}
                      </Code>
                    </Box>
                  </Stack>
                </Card>
              </Group>

              {/* Tags */}
              <Card
                shadow="none"
                padding={24}
                radius={12}
                withBorder
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: 'white',
                }}
              >
                <Text size="16px" fw={600} mb={16}>
                  Tags
                </Text>
                <Group gap={8}>
                  {model.tags.length > 0 ? (
                    model.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="light"
                        color="gray"
                        styles={{
                          root: {
                            fontSize: '13px',
                            fontWeight: 400,
                            textTransform: 'none',
                            backgroundColor: '#F3F4F6',
                            color: '#6B7280',
                          },
                        }}
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <Text size="14px" c="dimmed">
                      No tags added
                    </Text>
                  )}
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* Evaluations Tab */}
          <Tabs.Panel value="evaluations" pt={24} pb={32}>
            <Card
              shadow="none"
              padding={24}
              radius={12}
              withBorder
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: 'white',
              }}
            >
              <Text size="16px" fw={600} mb={16}>
                Model Evaluations
              </Text>
              <Stack gap={24}>
                {/* Metrics Summary */}
                <Group gap={24}>
                  <Box style={{ flex: 1 }}>
                    <Card padding={16} radius={8} style={{ backgroundColor: '#F9FAFB' }}>
                      <Text size="13px" c="dimmed" mb={4}>
                        Accuracy
                      </Text>
                      <Text size="24px" fw={700}>
                        {model.accuracy ? `${model.accuracy.toFixed(2)}%` : 'N/A'}
                      </Text>
                    </Card>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Card padding={16} radius={8} style={{ backgroundColor: '#F9FAFB' }}>
                      <Text size="13px" c="dimmed" mb={4}>
                        Precision
                      </Text>
                      <Text size="24px" fw={700}>
                        92.3%
                      </Text>
                    </Card>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Card padding={16} radius={8} style={{ backgroundColor: '#F9FAFB' }}>
                      <Text size="13px" c="dimmed" mb={4}>
                        Recall
                      </Text>
                      <Text size="24px" fw={700}>
                        89.7%
                      </Text>
                    </Card>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Card padding={16} radius={8} style={{ backgroundColor: '#F9FAFB' }}>
                      <Text size="13px" c="dimmed" mb={4}>
                        F1 Score
                      </Text>
                      <Text size="24px" fw={700}>
                        90.9%
                      </Text>
                    </Card>
                  </Box>
                </Group>

                <Divider />

                {/* Evaluation History */}
                <Box>
                  <Text size="15px" fw={600} mb={12}>
                    Evaluation History
                  </Text>
                  <Text size="14px" c="dimmed">
                    No evaluation history available yet. Run evaluations to see results here.
                  </Text>
                </Box>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* API Usage Tab */}
          <Tabs.Panel value="api" pt={24} pb={32}>
            <Card
              shadow="none"
              padding={24}
              radius={12}
              withBorder
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: 'white',
              }}
            >
              <Text size="16px" fw={600} mb={16}>
                API Usage
              </Text>
              <Stack gap={20}>
                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text size="14px" fw={500}>
                      REST API Endpoint
                    </Text>
                    <CopyButton value={`http://localhost:8000/api/models/${model.id}/predict`}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied!' : 'Copy'}>
                          <ActionIcon variant="subtle" color={copied ? 'green' : 'gray'} onClick={copy}>
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                  <Code
                    block
                    style={{
                      fontSize: '13px',
                      padding: '12px',
                      backgroundColor: '#F9FAFB',
                    }}
                  >
                    {`POST http://localhost:8000/api/models/${model.id}/predict`}
                  </Code>
                </Box>

                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text size="14px" fw={500}>
                      Python Example
                    </Text>
                    <CopyButton
                      value={`import requests\n\nresponse = requests.post(\n    "http://localhost:8000/api/models/${model.id}/predict",\n    json={"data": your_data}\n)\nprint(response.json())`}
                    >
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied!' : 'Copy'}>
                          <ActionIcon variant="subtle" color={copied ? 'green' : 'gray'} onClick={copy}>
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                  <Code
                    block
                    style={{
                      fontSize: '13px',
                      padding: '12px',
                      backgroundColor: '#F9FAFB',
                    }}
                  >
                    {`import requests

response = requests.post(
    "http://localhost:8000/api/models/${model.id}/predict",
    json={"data": your_data}
)
print(response.json())`}
                  </Code>
                </Box>

                <Divider />

                <Box>
                  <Text size="15px" fw={600} mb={12}>
                    Recent API Calls
                  </Text>
                  <Text size="14px" c="dimmed">
                    No API usage history available yet.
                  </Text>
                </Box>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* Versions Tab */}
          <Tabs.Panel value="versions" pt={24} pb={32}>
            <Card
              shadow="none"
              padding={24}
              radius={12}
              withBorder
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: 'white',
              }}
            >
              <Text size="16px" fw={600} mb={16}>
                Version History
              </Text>
              <Table
                horizontalSpacing="lg"
                verticalSpacing="md"
                styles={{
                  th: {
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #E5E7EB',
                    paddingTop: 12,
                    paddingBottom: 12,
                    backgroundColor: '#F9FAFB',
                  },
                  td: {
                    fontSize: '14px',
                    borderBottom: '1px solid #F3F4F6',
                    paddingTop: 12,
                    paddingBottom: 12,
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>VERSION</Table.Th>
                    <Table.Th>STATUS</Table.Th>
                    <Table.Th>ACCURACY</Table.Th>
                    <Table.Th>CREATED</Table.Th>
                    <Table.Th>ACTIONS</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>
                      <Code>{model.version}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="green" size="sm">
                        Current
                      </Badge>
                    </Table.Td>
                    <Table.Td>{model.accuracy ? `${model.accuracy.toFixed(2)}%` : 'N/A'}</Table.Td>
                    <Table.Td>{formatDate(model.created_at)}</Table.Td>
                    <Table.Td>
                      <Button variant="subtle" size="xs" color="gray">
                        View
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Card>
          </Tabs.Panel>

          {/* Training History Tab */}
          <Tabs.Panel value="history" pt={24} pb={32}>
            <Card
              shadow="none"
              padding={24}
              radius={12}
              withBorder
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: 'white',
              }}
            >
              <Group justify="space-between" mb={16}>
                <Group gap={8}>
                  <IconHistory size={20} color={COLORS.GRAY_700} />
                  <Text size="16px" fw={600}>
                    Training History
                  </Text>
                </Group>
                <Button variant="subtle" size="sm" color="gray">
                  Refresh
                </Button>
              </Group>
              <Table
                horizontalSpacing="lg"
                verticalSpacing="md"
                styles={{
                  th: {
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #E5E7EB',
                    paddingTop: 12,
                    paddingBottom: 12,
                    backgroundColor: '#F9FAFB',
                  },
                  td: {
                    fontSize: '14px',
                    borderBottom: '1px solid #F3F4F6',
                    paddingTop: 12,
                    paddingBottom: 12,
                  },
                  tr: {
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#F9FAFB',
                    },
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>RUN ID</Table.Th>
                    <Table.Th>STATUS</Table.Th>
                    <Table.Th>DURATION</Table.Th>
                    <Table.Th>FINAL LOSS</Table.Th>
                    <Table.Th>FINAL ACCURACY</Table.Th>
                    <Table.Th>DATASET</Table.Th>
                    <Table.Th>STARTED</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {/* Mock Training Run 1 - Completed */}
                  <Table.Tr onClick={() => navigate(`/models/${model.id}/training?run=run_003`)}>
                    <Table.Td>
                      <Code style={{ fontSize: '13px' }}>run_003</Code>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={8}>
                        <IconCircleCheck size={16} color={COLORS.SUCCESS} />
                        <Badge variant="light" color="green" size="sm">
                          Completed
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <IconClock size={14} color="#6B7280" />
                        <Text size="14px">45m 32s</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="14px" fw={500}>
                        0.1967
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="14px" fw={600} c={COLORS.SUCCESS}>
                        {model.accuracy?.toFixed(2) || '92.4'}%
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        size="14px"
                        style={{ color: COLORS.PRIMARY, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (model.dataset_id) {
                            navigate(`/datasets/${model.dataset_id}`)
                          }
                        }}
                      >
                        {dataset?.name || model.dataset_id || 'N/A'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="14px">Jan 15, 2025 10:30 AM</Text>
                    </Table.Td>
                  </Table.Tr>

                  {/* Mock Training Run 2 - Failed */}
                  <Table.Tr onClick={() => navigate(`/models/${model.id}/training?run=run_002`)}>
                    <Table.Td>
                      <Code style={{ fontSize: '13px' }}>run_002</Code>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={8}>
                        <IconCircleX size={16} color={COLORS.ERROR} />
                        <Badge variant="light" color="red" size="sm">
                          Failed
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <IconClock size={14} color="#6B7280" />
                        <Text size="14px">12m 18s</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="14px" fw={500} c="dimmed">
                        N/A
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="14px" fw={500} c="dimmed">
                        N/A
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        size="14px"
                        style={{ color: COLORS.PRIMARY, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (model.dataset_id) {
                            navigate(`/datasets/${model.dataset_id}`)
                          }
                        }}
                      >
                        {dataset?.name || model.dataset_id || 'N/A'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="14px">Jan 14, 2025 3:45 PM</Text>
                    </Table.Td>
                  </Table.Tr>

                  {/* Mock Training Run 3 - Stopped */}
                  <Table.Tr onClick={() => navigate(`/models/${model.id}/training?run=run_001`)}>
                    <Table.Td>
                      <Code style={{ fontSize: '13px' }}>run_001</Code>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={8}>
                        <IconCircleMinus size={16} color={COLORS.WARNING} />
                        <Badge variant="light" color="orange" size="sm">
                          Stopped
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <IconClock size={14} color="#6B7280" />
                        <Text size="14px">8m 42s</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="14px" fw={500}>
                        0.3456
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="14px" fw={500}>
                        85.7%
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        size="14px"
                        style={{ color: COLORS.PRIMARY, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (model.dataset_id) {
                            navigate(`/datasets/${model.dataset_id}`)
                          }
                        }}
                      >
                        {dataset?.name || model.dataset_id || 'N/A'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="14px">Jan 13, 2025 9:20 AM</Text>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Stack>
  )
}
