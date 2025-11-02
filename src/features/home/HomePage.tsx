import {
  Box,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import {
  IconBolt,
  IconDatabase,
  IconDownload,
  IconStack2,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DatasetSelector } from '@/shared/components'
import type { DatasetOption } from '@/shared/types'
import { COLORS } from '@/shared/config/colors'
import { useDatasets } from '@/shared/hooks/useDatasets'
import { formatters } from '@/shared/utils/formatters'

interface RecentItem {
  id: string
  name: string
  type: 'Model' | 'Dataset'
  timestamp: string
}

const recentItems: RecentItem[] = [
  {
    id: '1',
    name: 'credit-risk-classifier',
    type: 'Model',
    timestamp: '2 Hours Ago',
  },
  {
    id: '2',
    name: 'credit-default-2023',
    type: 'Dataset',
    timestamp: '2 Hours Ago',
  },
  {
    id: '3',
    name: 'customer-churn-predictor',
    type: 'Model',
    timestamp: '1 Day Ago',
  },
  {
    id: '4',
    name: 'customer-behavior-logs',
    type: 'Dataset',
    timestamp: '2 Days Ago',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const [selectedDataset, setSelectedDataset] = useState<string>('')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Fetch datasets from API
  const { data: apiDatasets, isLoading: isDatasetsLoading } = useDatasets()

  // Transform API datasets to DatasetOption format
  const datasets: DatasetOption[] = useMemo(() => {
    if (!apiDatasets) return []

    return apiDatasets
      .filter(dataset => dataset.readiness === 'ready')
      .map(dataset => ({
        value: dataset.id,
        label: dataset.name,
        domain: formatters.domain(dataset.domain),
        rows: `${dataset.size} files`,
        tags: dataset.tags || [],
        storage: formatters.storage(dataset.storage),
      }))
  }, [apiDatasets])

  // Set initial selected dataset when data loads
  useEffect(() => {
    if (datasets.length > 0 && !selectedDataset) {
      setSelectedDataset(datasets[0].value)
    }
  }, [datasets, selectedDataset])

  return (
    <Stack
      gap={0}
      style={{ backgroundColor: COLORS.GRAY_50, paddingBottom: '2rem' }}
    >
      {/* Header Section */}
      <Box px={32} pt={40} pb={24}>
        <Title order={1} size={32} fw={700} mb={8}>
          Welcome to DeepVariance
        </Title>
        <Text size="15px" c="dimmed">
          Research-first machine learning platform for model development and
          dataset management
        </Text>
      </Box>

      {/* Main Content */}
      <Box px={32}>
        <Group align="stretch" gap={24} wrap="nowrap">
          {/* Launch Training Card */}
          <Card
            shadow="none"
            padding={32}
            radius={12}
            withBorder
            style={{
              width: 520,
              borderColor: COLORS.GRAY_200,
              backgroundColor: 'white',
            }}
          >
            <Stack gap={20}>
              <Title order={3} size={20} fw={600}>
                Launch a new training run
              </Title>

              <Text size="15px" c="dimmed" style={{ lineHeight: 1.6 }}>
                Choose an uploaded dataset to kick off training immediately, or
                import a new dataset to get started.
              </Text>

              {/* Dataset Picker Section */}
              <Box>
                <Text
                  size="13px"
                  fw={500}
                  c="dimmed"
                  mb={12}
                  tt="uppercase"
                  style={{ letterSpacing: '0.5px' }}
                >
                  Pick a Dataset
                </Text>

                {isDatasetsLoading ? (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 110,
                      border: `1px solid ${COLORS.GRAY_200}`,
                      borderRadius: 6,
                    }}
                  >
                    <Loader size="sm" color={COLORS.PRIMARY} />
                  </Box>
                ) : datasets.length === 0 ? (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 110,
                      border: `1px solid ${COLORS.GRAY_200}`,
                      borderRadius: 6,
                      backgroundColor: COLORS.GRAY_50,
                    }}
                  >
                    <Text size="15px" c="dimmed">
                      No ready datasets available. Import a dataset to get started.
                    </Text>
                  </Box>
                ) : (
                  <DatasetSelector
                    datasets={datasets}
                    value={selectedDataset}
                    onChange={setSelectedDataset}
                  />
                )}

                {/* Action Buttons */}
                <Group gap={12} mt={10} justify="flex-end">
                  <Button
                    leftSection={<IconBolt size={18} />}
                    color="orange"
                    size="md"
                    disabled={!selectedDataset || isDatasetsLoading}
                    styles={{
                      root: {
                        backgroundColor: COLORS.PRIMARY,
                        fontSize: '15px',
                        fontWeight: 500,
                      },
                    }}
                  >
                    Start Training
                  </Button>
                  <Button
                    leftSection={<IconDownload size={18} />}
                    variant="light"
                    color="orange"
                    size="md"
                    onClick={() => navigate('/datasets?import=true')}
                    styles={{
                      root: {
                        fontSize: '15px',
                        fontWeight: 500,
                      },
                    }}
                  >
                    Import Dataset
                  </Button>
                </Group>
              </Box>
            </Stack>
          </Card>

          {/* Recently Opened Card */}
          <Card
            shadow="none"
            padding={32}
            radius={12}
            withBorder
            style={{
              flex: 1,
              borderColor: COLORS.GRAY_200,
              backgroundColor: 'white',
            }}
          >
            <Title order={3} size={20} fw={600} mb={24}>
              Recently Opened
            </Title>

            <Stack gap={0}>
              {recentItems.map(item => (
                <Group
                  key={item.id}
                  justify="space-between"
                  p={12}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 6,
                    transition: 'background-color 0.15s ease',
                    backgroundColor:
                      hoveredItem === item.id ? COLORS.PRIMARY_LIGHT : 'transparent',
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Group gap={12}>
                    <Box
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        backgroundColor:
                          item.type === 'Model' ? COLORS.PRIMARY_HOVER : COLORS.SUCCESS_LIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.type === 'Model' ? (
                        <IconStack2 size={18} color={COLORS.PRIMARY} />
                      ) : (
                        <IconDatabase size={18} color={COLORS.SUCCESS} />
                      )}
                    </Box>
                    <div>
                      <Text size="15px" fw={500} mb={2}>
                        {item.name}
                      </Text>
                      <Text size="13px" c="dimmed">
                        {item.type} • {item.timestamp}
                      </Text>
                    </div>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Card>
        </Group>

        {/* Bottom Row */}
        <Group align="stretch" gap={24} mt={24} wrap="nowrap">
          {/* System Status */}
          <Card
            shadow="none"
            padding={32}
            radius={12}
            withBorder
            style={{
              flex: 1,
              borderColor: COLORS.GRAY_200,
              backgroundColor: 'white',
            }}
          >
            <Title order={3} size={20} fw={600} mb={24}>
              System Status
            </Title>

            <Stack gap={16}>
              <Group justify="space-between">
                <Text size="15px" c="dimmed">
                  Environment
                </Text>
                <Group gap={8}>
                  <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: COLORS.SUCCESS,
                    }}
                  />
                  <Text size="15px" fw={500}>
                    Active
                  </Text>
                </Group>
              </Group>

              <Group justify="space-between">
                <Text size="15px" c="dimmed">
                  GPU Slots
                </Text>
                <Text size="15px" fw={500}>
                  2 available
                </Text>
              </Group>
            </Stack>
          </Card>

          {/* What's New */}
          <Card
            shadow="none"
            padding={32}
            radius={12}
            withBorder
            style={{
              flex: 1,
              borderColor: COLORS.GRAY_200,
              backgroundColor: 'white',
            }}
          >
            <Title order={3} size={20} fw={600} mb={24}>
              What's New
            </Title>

            <Text size="15px" c="dimmed" style={{ lineHeight: 1.6 }}>
              Check out the latest features and improvements in the{' '}
              <Text
                span
                size="15px"
                c={COLORS.PRIMARY}
                fw={500}
                style={{ cursor: 'pointer' }}
              >
                release notes
              </Text>
              .
            </Text>
          </Card>
        </Group>
      </Box>
    </Stack>
  )
}
