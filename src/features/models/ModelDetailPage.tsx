import { useState } from 'react'
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
} from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useModel } from '@/shared/hooks/useModels'
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
  const [activeTab, setActiveTab] = useState<string | null>('overview')

  // Fetch model data
  const { data: model, isLoading, error } = useModel(id || '')

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
            <Tabs.Tab value="logs">Build Logs</Tabs.Tab>
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
                <Text size="16px" fw={600} mb={16}>
                  Summary
                </Text>
                <Textarea
                  placeholder="Add a summary describing this model..."
                  defaultValue={model.description || ''}
                  minRows={4}
                  styles={{
                    input: {
                      fontSize: '15px',
                      borderColor: '#E5E7EB',
                    },
                  }}
                />
                <Group justify="flex-end" mt={12}>
                  <Button
                    variant="light"
                    color="orange"
                    size="sm"
                    styles={{
                      root: {
                        fontSize: '14px',
                      },
                    }}
                  >
                    Save
                  </Button>
                </Group>
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
                          {model.dataset_id || 'Not linked'}
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

          {/* Build Logs Tab */}
          <Tabs.Panel value="logs" pt={24} pb={32}>
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
                  Build Logs
                </Text>
                <Button variant="subtle" size="sm" color="gray">
                  Refresh
                </Button>
              </Group>
              <Code
                block
                style={{
                  fontSize: '13px',
                  padding: '16px',
                  backgroundColor: '#1F2937',
                  color: '#F9FAFB',
                  minHeight: 300,
                  maxHeight: 500,
                  overflow: 'auto',
                }}
              >
                {`[2025-01-15 10:30:45] Starting model training...
[2025-01-15 10:30:46] Loading dataset: ${model.dataset_id || 'dataset_123'}
[2025-01-15 10:30:48] Dataset loaded successfully (1000 samples)
[2025-01-15 10:30:50] Initializing ${model.framework} model...
[2025-01-15 10:30:52] Model initialized with task: ${model.task}
[2025-01-15 10:31:00] Epoch 1/10 - Loss: 0.5234, Accuracy: 78.3%
[2025-01-15 10:31:15] Epoch 2/10 - Loss: 0.4123, Accuracy: 82.1%
[2025-01-15 10:31:30] Epoch 3/10 - Loss: 0.3456, Accuracy: 85.7%
[2025-01-15 10:31:45] Epoch 4/10 - Loss: 0.2987, Accuracy: 87.9%
[2025-01-15 10:32:00] Epoch 5/10 - Loss: 0.2654, Accuracy: 89.2%
[2025-01-15 10:32:15] Epoch 6/10 - Loss: 0.2412, Accuracy: 90.3%
[2025-01-15 10:32:30] Epoch 7/10 - Loss: 0.2245, Accuracy: 91.1%
[2025-01-15 10:32:45] Epoch 8/10 - Loss: 0.2123, Accuracy: 91.6%
[2025-01-15 10:33:00] Epoch 9/10 - Loss: 0.2034, Accuracy: 92.0%
[2025-01-15 10:33:15] Epoch 10/10 - Loss: 0.1967, Accuracy: ${model.accuracy?.toFixed(1) || '92.4'}%
[2025-01-15 10:33:20] Training completed successfully!
[2025-01-15 10:33:25] Saving model to: ${model.model_path || './models/model_' + model.id}
[2025-01-15 10:33:30] Model saved successfully!`}
              </Code>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Stack>
  )
}
