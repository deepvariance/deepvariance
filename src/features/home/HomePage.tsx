import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  SimpleGrid,
  Progress,
  Divider,
} from '@mantine/core'
import {
  IconUpload,
  IconBolt,
  IconDatabase,
  IconStack2,
  IconChartBar,
  IconClock,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useDatasets } from '@/shared/hooks/useDatasets'
import { useModels } from '@/shared/hooks/useModels'
import { ImportDatasetModal } from '@/features/datasets/ImportDatasetModal'
import { TrainModelModal } from '@/features/models/TrainModelModal'
import { formatDate } from '@/shared/utils/formatters'

export function HomePage() {
  const navigate = useNavigate()
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [trainModalOpen, setTrainModalOpen] = useState(false)

  // Fetch data
  const { data: datasets = [] } = useDatasets()
  const { data: models = [] } = useModels()

  // Calculate stats
  const readyDatasets = datasets.filter(d => d.readiness === 'ready').length
  const totalModels = models.length
  const trainingModels = models.filter(m => m.status === 'training' || m.status === 'queued')

  // Get recent activity (last 5 items)
  const recentActivity = [
    ...datasets.slice(0, 3).map(d => ({
      id: d.id,
      name: d.name,
      type: 'dataset' as const,
      timestamp: d.created_at,
      status: d.readiness,
    })),
    ...models.slice(0, 3).map(m => ({
      id: m.id,
      name: m.name,
      type: 'model' as const,
      timestamp: m.created_at,
      status: m.status,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return (
    <Stack gap={0} style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Header Section */}
      <Box px={32} pt={40} pb={32}>
        <Title order={1} size={36} fw={700} mb={8}>
          Welcome to DeepVariance
        </Title>
        <Text size="16px" c="dimmed">
          From dataset to model in minutes. Start training with just a few clicks.
        </Text>
      </Box>

      {/* Main Content */}
      <Box px={32}>
        {/* Stats Row */}
        <SimpleGrid cols={3} spacing={20} mb={32}>
          <Card
            shadow="sm"
            padding="lg"
            radius={12}
            withBorder
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onClick={() => navigate('/datasets')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Group justify="space-between">
              <div>
                <Text size="14px" c="dimmed" fw={500} mb={8}>
                  Datasets
                </Text>
                <Text size="32px" fw={700}>
                  {readyDatasets}
                </Text>
                <Text size="13px" c="dimmed" mt={4}>
                  Ready to use
                </Text>
              </div>
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconDatabase size={28} color="#0284C7" />
              </Box>
            </Group>
          </Card>

          <Card
            shadow="sm"
            padding="lg"
            radius={12}
            withBorder
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onClick={() => navigate('/models')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Group justify="space-between">
              <div>
                <Text size="14px" c="dimmed" fw={500} mb={8}>
                  Models
                </Text>
                <Text size="32px" fw={700}>
                  {totalModels}
                </Text>
                <Text size="13px" c="dimmed" mt={4}>
                  Total trained
                </Text>
              </div>
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: '#FFE8E6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconStack2 size={28} color="#FF5C4D" />
              </Box>
            </Group>
          </Card>

          <Card
            shadow="sm"
            padding="lg"
            radius={12}
            withBorder
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: 'white',
            }}
          >
            <Group justify="space-between">
              <div>
                <Text size="14px" c="dimmed" fw={500} mb={8}>
                  Training
                </Text>
                <Text size="32px" fw={700}>
                  {trainingModels.length}
                </Text>
                <Text size="13px" c="dimmed" mt={4}>
                  Active jobs
                </Text>
              </div>
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconChartBar size={28} color="#2563EB" />
              </Box>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Quick Actions Row */}
        <SimpleGrid cols={2} spacing={24} mb={32}>
          {/* Import Dataset Card */}
          <Card
            shadow="md"
            padding={32}
            radius={16}
            withBorder
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: 'white',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }}
          >
            <Stack gap={24}>
              <Group gap={16}>
                <Box
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: '#DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconUpload size={32} color="#2563EB" />
                </Box>
                <div style={{ flex: 1 }}>
                  <Title order={3} size={22} fw={600} mb={6}>
                    Import Dataset
                  </Title>
                  <Text size="14px" c="dimmed">
                    Upload a new dataset to get started
                  </Text>
                </div>
              </Group>

              <Divider />

              <Stack gap={12}>
                <Group gap={8}>
                  <Badge variant="light" color="blue" size="lg">
                    Vision
                  </Badge>
                  <Badge variant="light" color="blue" size="lg">
                    Tabular
                  </Badge>
                </Group>
                <Text size="14px" c="dimmed">
                  Supports Vision and Tabular datasets up to 100GB
                </Text>
              </Stack>

              <Button
                size="lg"
                leftSection={<IconUpload size={20} />}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                onClick={() => setImportModalOpen(true)}
                styles={{
                  root: {
                    fontSize: '15px',
                    fontWeight: 600,
                    height: 48,
                  },
                }}
              >
                Upload Dataset
              </Button>

              <Text size="13px" c="dimmed" ta="center">
                {readyDatasets > 0 ? (
                  <>
                    You have <strong>{readyDatasets}</strong> dataset{readyDatasets !== 1 ? 's' : ''} ready
                  </>
                ) : (
                  'No datasets yet. Upload your first one!'
                )}
              </Text>
            </Stack>
          </Card>

          {/* Train Model Card */}
          <Card
            shadow="md"
            padding={32}
            radius={16}
            withBorder
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: 'white',
              background: 'linear-gradient(135deg, #ffffff 0%, #fff7f6 100%)',
            }}
          >
            <Stack gap={24}>
              <Group gap={16}>
                <Box
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: '#FFE8E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconBolt size={32} color="#FF5C4D" />
                </Box>
                <div style={{ flex: 1 }}>
                  <Title order={3} size={22} fw={600} mb={6}>
                    Train Model
                  </Title>
                  <Text size="14px" c="dimmed">
                    Start a new training job
                  </Text>
                </div>
              </Group>

              <Divider />

              <Stack gap={12}>
                <Group gap={8}>
                  <Badge variant="light" color="orange" size="lg">
                    Classification
                  </Badge>
                  <Badge variant="light" color="orange" size="lg">
                    Detection
                  </Badge>
                </Group>
                <Text size="14px" c="dimmed">
                  Classification, Regression, Clustering, Detection
                </Text>
              </Stack>

              <Button
                size="lg"
                leftSection={<IconBolt size={20} />}
                color="orange"
                onClick={() => setTrainModalOpen(true)}
                disabled={readyDatasets === 0}
                styles={{
                  root: {
                    backgroundColor: '#FF5C4D',
                    fontSize: '15px',
                    fontWeight: 600,
                    height: 48,
                  },
                }}
              >
                Start Training
              </Button>

              <Text size="13px" c="dimmed" ta="center">
                {readyDatasets > 0 ? (
                  <>
                    {totalModels > 0 ? `${totalModels} model${totalModels !== 1 ? 's' : ''} trained` : 'Train your first model!'}
                  </>
                ) : (
                  'Upload a dataset first to train models'
                )}
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Active Training Jobs */}
        {trainingModels.length > 0 && (
          <Card
            shadow="sm"
            padding={24}
            radius={12}
            withBorder
            mb={32}
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: 'white',
            }}
          >
            <Title order={4} size={18} fw={600} mb={20}>
              Active Training Jobs ({trainingModels.length})
            </Title>
            <Stack gap={16}>
              {trainingModels.map((model) => (
                <Box
                  key={model.id}
                  p={16}
                  style={{
                    borderRadius: 8,
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onClick={() => navigate(`/models/${model.id}/training`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB'
                  }}
                >
                  <Group justify="space-between" mb={12}>
                    <Group gap={12}>
                      <Box
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          backgroundColor: '#FFE8E6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconStack2 size={16} color="#FF5C4D" />
                      </Box>
                      <div>
                        <Text size="15px" fw={500}>
                          {model.name}
                        </Text>
                        <Text size="13px" c="dimmed">
                          {model.task.charAt(0).toUpperCase() + model.task.slice(1)}
                        </Text>
                      </div>
                    </Group>
                    <Badge
                      variant="light"
                      color={model.status === 'training' ? 'blue' : 'cyan'}
                      size="lg"
                    >
                      {model.status === 'training' ? 'Training' : 'Queued'}
                    </Badge>
                  </Group>
                  {model.status === 'training' && (
                    <>
                      <Progress
                        value={Math.random() * 100}
                        size="sm"
                        color="blue"
                        animated
                        mb={8}
                      />
                      <Text size="12px" c="dimmed">
                        Estimated time remaining: ~{Math.floor(Math.random() * 30 + 10)} minutes
                      </Text>
                    </>
                  )}
                </Box>
              ))}
            </Stack>
          </Card>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <Card
            shadow="sm"
            padding={24}
            radius={12}
            withBorder
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: 'white',
            }}
          >
            <Title order={4} size={18} fw={600} mb={20}>
              Recent Activity
            </Title>
            <Stack gap={0}>
              {recentActivity.map((item, index) => (
                <Box key={item.id}>
                  <Group
                    justify="space-between"
                    p={12}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 6,
                      transition: 'background-color 0.15s ease',
                    }}
                    onClick={() =>
                      navigate(item.type === 'dataset' ? `/datasets/${item.id}` : `/models/${item.id}`)
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Group gap={12}>
                      <Box
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: item.type === 'dataset' ? '#E0F2FE' : '#FFE8E6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.type === 'dataset' ? (
                          <IconDatabase size={18} color="#0284C7" />
                        ) : (
                          <IconStack2 size={18} color="#FF5C4D" />
                        )}
                      </Box>
                      <div>
                        <Text size="15px" fw={500} mb={2}>
                          {item.name}
                        </Text>
                        <Group gap={8}>
                          <Badge
                            variant="light"
                            size="sm"
                            color={item.type === 'dataset' ? 'blue' : 'orange'}
                          >
                            {item.type === 'dataset' ? 'Dataset' : 'Model'}
                          </Badge>
                          <Text size="13px" c="dimmed">
                            <IconClock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            {formatDate(item.timestamp)}
                          </Text>
                        </Group>
                      </div>
                    </Group>
                    <Badge
                      variant="dot"
                      color={
                        item.status === 'ready' || item.status === 'active'
                          ? 'green'
                          : item.status === 'training'
                            ? 'blue'
                            : 'orange'
                      }
                    >
                      {item.status}
                    </Badge>
                  </Group>
                  {index < recentActivity.length - 1 && (
                    <Divider my={0} style={{ marginLeft: 60 }} />
                  )}
                </Box>
              ))}
            </Stack>
          </Card>
        )}
      </Box>

      {/* Modals */}
      <ImportDatasetModal opened={importModalOpen} onClose={() => setImportModalOpen(false)} />
      <TrainModelModal opened={trainModalOpen} onClose={() => setTrainModalOpen(false)} />
    </Stack>
  )
}
