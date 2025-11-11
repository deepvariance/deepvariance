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
import { IconPlus, IconSearch, IconDatabase } from '@tabler/icons-react'

interface Dataset {
  id: string
  name: string
  domain: 'Tabular' | 'Vision' | 'Text'
  rows: string
  readiness: 'Ready' | 'Profiling' | 'Draft'
  storage: 'GCS' | 'S3'
  freshness: string
  tags: string[]
}

const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: 'credit-default-2023',
    domain: 'Tabular',
    rows: '120.0K',
    readiness: 'Ready',
    storage: 'GCS',
    freshness: 'Sep 29, 2025',
    tags: ['finance', 'public'],
  },
  {
    id: '2',
    name: 'customer-behavior-logs',
    domain: 'Tabular',
    rows: '450.0K',
    readiness: 'Ready',
    storage: 'S3',
    freshness: 'Oct 2, 2025',
    tags: ['retail', 'timeseries'],
  },
  {
    id: '3',
    name: 'housing-prices-full',
    domain: 'Tabular',
    rows: '85.0K',
    readiness: 'Profiling',
    storage: 'GCS',
    freshness: 'Oct 4, 2025',
    tags: ['real-estate', 'regression'],
  },
  {
    id: '4',
    name: 'imagenet-subset-2024',
    domain: 'Vision',
    rows: '50.0K',
    readiness: 'Ready',
    storage: 'S3',
    freshness: 'Sep 15, 2025',
    tags: ['cv', 'classification'],
  },
  {
    id: '5',
    name: 'sentiment-reviews-raw',
    domain: 'Text',
    rows: '200.0K',
    readiness: 'Draft',
    storage: 'GCS',
    freshness: 'Oct 6, 2025',
    tags: ['nlp', 'sentiment'],
  },
]

const domainColors: Record<Dataset['domain'], string> = {
  Tabular: 'blue',
  Vision: 'teal',
  Text: 'purple',
}

const readinessColors: Record<Dataset['readiness'], string> = {
  Ready: 'green',
  Profiling: 'orange',
  Draft: 'gray',
}

export function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [domainFilter, setDomainFilter] = useState<string | null>(null)
  const [readinessFilter, setReadinessFilter] = useState<string | null>(null)

  const filteredDatasets = mockDatasets.filter((dataset) => {
    const matchesSearch =
      searchQuery === '' ||
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDomain =
      domainFilter === null || domainFilter === 'All Domains' || dataset.domain === domainFilter
    const matchesReadiness =
      readinessFilter === null ||
      readinessFilter === 'All Readiness' ||
      dataset.readiness === readinessFilter

    return matchesSearch && matchesDomain && matchesReadiness
  })

  return (
    <Stack gap={0} style={{ height: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Header Section */}
      <Box px={32} pt={40} pb={24}>
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} size={32} fw={700} mb={8}>
              Datasets
            </Title>
            <Text size="15px" c="dimmed">
              Catalog of datasets with provenance and readiness for training
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
            Import Dataset
          </Button>
        </Group>
      </Box>

      {/* Filters */}
      <Box px={32} pb={24}>
        <Group gap={12}>
          <TextInput
            placeholder="Search datasets..."
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
            placeholder="All Domains"
            data={['All Domains', 'Tabular', 'Vision', 'Text']}
            value={domainFilter}
            onChange={setDomainFilter}
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
            placeholder="All Readiness"
            data={['All Readiness', 'Ready', 'Profiling', 'Draft']}
            value={readinessFilter}
            onChange={setReadinessFilter}
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
                <Table.Th>DOMAIN</Table.Th>
                <Table.Th>ROWS</Table.Th>
                <Table.Th>READINESS</Table.Th>
                <Table.Th>STORAGE</Table.Th>
                <Table.Th>FRESHNESS</Table.Th>
                <Table.Th>TAGS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredDatasets.length > 0 ? (
                filteredDatasets.map((dataset) => (
                  <Table.Tr
                    key={dataset.id}
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
                            backgroundColor: '#D4F4DD',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconDatabase size={16} color="#22C55E" />
                        </Box>
                        <Text size="15px" fw={500}>
                          {dataset.name}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={domainColors[dataset.domain]}
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
                        {dataset.domain}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="15px" fw={500}>
                        {dataset.rows}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant={dataset.readiness === 'Ready' ? 'light' : 'outline'}
                        color={readinessColors[dataset.readiness]}
                        styles={{
                          root: {
                            fontSize: '13px',
                            fontWeight: 500,
                            textTransform: 'none',
                            paddingLeft: 10,
                            paddingRight: 10,
                            backgroundColor:
                              dataset.readiness === 'Ready' ? '#D4F4DD' : 'transparent',
                            color:
                              dataset.readiness === 'Ready'
                                ? '#16A34A'
                                : dataset.readiness === 'Profiling'
                                  ? '#F97316'
                                  : '#6B7280',
                            borderColor:
                              dataset.readiness === 'Ready'
                                ? 'transparent'
                                : dataset.readiness === 'Profiling'
                                  ? '#F97316'
                                  : '#D1D5DB',
                          },
                        }}
                      >
                        {dataset.readiness}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color="gray"
                        styles={{
                          root: {
                            fontSize: '11px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            paddingLeft: 8,
                            paddingRight: 8,
                            backgroundColor: '#F3F4F6',
                            color: '#6B7280',
                          },
                        }}
                      >
                        {dataset.storage}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="15px" c="dimmed">
                        {dataset.freshness}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        {dataset.tags.map((tag) => (
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
                  <Table.Td colSpan={7}>
                    <Text ta="center" c="dimmed" size="15px" py="xl">
                      No datasets found
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
