import { useState } from 'react'
import {
  Table,
  TextInput,
  Select,
  Button,
  Badge,
  Group,
  Stack,
  Title,
  Text,
  Box,
} from '@mantine/core'
import { IconPlus, IconSearch, IconStack2 } from '@tabler/icons-react'

interface Model {
  id: string
  name: string
  task: 'Classification' | 'Regression' | 'Vision'
  version: string
  status: 'Ready' | 'Draft'
  lastUpdated: string
  tags: string[]
}

const mockModels: Model[] = [
  {
    id: '1',
    name: 'credit-risk-classifier',
    task: 'Classification',
    version: 'v0.1.3',
    status: 'Ready',
    lastUpdated: 'Oct 6, 2025',
    tags: ['tabular', 'baseline'],
  },
  {
    id: '2',
    name: 'customer-churn-predictor',
    task: 'Classification',
    version: 'v1.2.0',
    status: 'Ready',
    lastUpdated: 'Oct 5, 2025',
    tags: ['tabular', 'production'],
  },
  {
    id: '3',
    name: 'house-price-estimator',
    task: 'Regression',
    version: 'v0.0.5',
    status: 'Draft',
    lastUpdated: 'Oct 3, 2025',
    tags: ['tabular', 'experimental'],
  },
  {
    id: '4',
    name: 'image-classifier-resnet',
    task: 'Vision',
    version: 'v2.1.0',
    status: 'Ready',
    lastUpdated: 'Oct 1, 2025',
    tags: ['cv', 'transfer-learning'],
  },
]

const taskColors: Record<Model['task'], string> = {
  Classification: 'blue',
  Regression: 'purple',
  Vision: 'teal',
}

const statusColors: Record<Model['status'], string> = {
  Ready: 'green',
  Draft: 'orange',
}

export function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [taskFilter, setTaskFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredModels = mockModels.filter((model) => {
    const matchesSearch =
      searchQuery === '' ||
      model.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTask = taskFilter === null || taskFilter === 'All Tasks' || model.task === taskFilter
    const matchesStatus =
      statusFilter === null || statusFilter === 'All Status' || model.status === statusFilter

    return matchesSearch && matchesTask && matchesStatus
  })

  return (
    <Stack gap={0} style={{ height: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Header Section */}
      <Box px={32} pt={40} pb={24}>
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} size={32} fw={700} mb={8}>
              Models
            </Title>
            <Text size="15px" c="dimmed">
              Registry of trainable and evaluable models, experiments, and versions
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            color="orange"
            size="md"
            styles={{
              root: {
                backgroundColor: '#FF5C4D',
                fontSize: '15px',
                fontWeight: 500,
                paddingLeft: 20,
                paddingRight: 24,
                height: 40,
              },
            }}
          >
            Create Model
          </Button>
        </Group>
      </Box>

      {/* Filters */}
      <Box px={32} pb={24}>
        <Group gap={12}>
          <TextInput
            placeholder="Search models..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            style={{ flex: 1 }}
            styles={{
              input: {
                fontSize: '15px',
                borderColor: '#E5E7EB',
                backgroundColor: 'white',
              },
            }}
          />
          <Select
            placeholder="All Tasks"
            data={['All Tasks', 'Classification', 'Regression', 'Vision']}
            value={taskFilter}
            onChange={setTaskFilter}
            clearable
            styles={{
              input: {
                fontSize: '15px',
                borderColor: '#E5E7EB',
                backgroundColor: 'white',
                minWidth: 160,
              },
            }}
          />
          <Select
            placeholder="All Status"
            data={['All Status', 'Ready', 'Draft']}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            styles={{
              input: {
                fontSize: '15px',
                borderColor: '#E5E7EB',
                backgroundColor: 'white',
                minWidth: 160,
              },
            }}
          />
        </Group>
      </Box>

      {/* Table */}
      <Box px={32}>
        <Box
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
          }}
        >
          <Table
            horizontalSpacing="xl"
            verticalSpacing="md"
            styles={{
              th: {
                fontSize: '12px',
                fontWeight: 600,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1px solid #E5E7EB',
                paddingTop: 16,
                paddingBottom: 16,
                backgroundColor: '#F9FAFB',
              },
              td: {
                fontSize: '15px',
                borderBottom: '1px solid #F3F4F6',
                paddingTop: 16,
                paddingBottom: 16,
              },
              tr: {
                transition: 'background-color 0.15s ease',
              },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>NAME</Table.Th>
                <Table.Th>TASK</Table.Th>
                <Table.Th>LATEST VERSION</Table.Th>
                <Table.Th>STATUS</Table.Th>
                <Table.Th>LAST UPDATED</Table.Th>
                <Table.Th>TAGS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <Table.Tr
                    key={model.id}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FAFAFA'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Table.Td>
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
                        <Text size="15px" fw={500}>
                          {model.name}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={taskColors[model.task]}
                        styles={{
                          root: {
                            fontSize: '13px',
                            fontWeight: 500,
                            textTransform: 'none',
                            paddingLeft: 10,
                            paddingRight: 10,
                          },
                        }}
                      >
                        {model.task}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="15px" fw={500} style={{ fontFamily: 'monospace' }}>
                        {model.version}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant={model.status === 'Ready' ? 'light' : 'outline'}
                        color={statusColors[model.status]}
                        styles={{
                          root: {
                            fontSize: '13px',
                            fontWeight: 500,
                            textTransform: 'none',
                            paddingLeft: 10,
                            paddingRight: 10,
                            backgroundColor:
                              model.status === 'Ready' ? '#D4F4DD' : 'transparent',
                            color: model.status === 'Ready' ? '#16A34A' : '#F97316',
                            borderColor: model.status === 'Ready' ? 'transparent' : '#F97316',
                          },
                        }}
                      >
                        {model.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="15px" c="dimmed">
                        {model.lastUpdated}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        {model.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="light"
                            color="gray"
                            styles={{
                              root: {
                                fontSize: '12px',
                                fontWeight: 400,
                                textTransform: 'none',
                                backgroundColor: '#F3F4F6',
                                color: '#6B7280',
                              },
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" size="15px" py="xl">
                      No models found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Box>
    </Stack>
  )
}
