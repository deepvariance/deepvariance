import { ActionIcon, Badge, Box, Group, Table, Text, Tooltip } from '@mantine/core'
import { IconDatabase, IconTrash } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import type { Dataset } from '../../shared/api/datasets'
import { formatters } from '../../shared/utils/formatters'
import { DOMAIN_COLORS, READINESS_COLORS, BADGE_STYLES, TABLE_STYLES } from '../../shared/constants/theme'

interface DatasetsTableProps {
  datasets: Dataset[]
  onDelete: (id: string, name: string) => void
}

export function DatasetsTable({ datasets, onDelete }: DatasetsTableProps) {
  const navigate = useNavigate()

  const handleRowClick = (datasetId: string) => {
    navigate(`/datasets/${datasetId}`)
  }

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    onDelete(id, name)
  }

  if (!datasets?.length) {
    return (
      <Box
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}
      >
        <Table>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>
                <Text ta="center" c="dimmed" size="15px" py="xl">
                  No datasets found
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Box>
    )
  }

  return (
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
          th: TABLE_STYLES.th,
          td: TABLE_STYLES.td,
          tr: TABLE_STYLES.tr,
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>NAME</Table.Th>
            <Table.Th>DOMAIN</Table.Th>
            <Table.Th>FILES</Table.Th>
            <Table.Th>READINESS</Table.Th>
            <Table.Th>STORAGE</Table.Th>
            <Table.Th>FRESHNESS</Table.Th>
            <Table.Th>TAGS</Table.Th>
            <Table.Th>ACTIONS</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {datasets.map(dataset => (
            <Table.Tr
              key={dataset.id}
              style={{ cursor: 'pointer' }}
              onClick={() => handleRowClick(dataset.id)}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                  color={DOMAIN_COLORS[dataset.domain] || 'gray'}
                  styles={BADGE_STYLES.domain}
                >
                  {formatters.domain(dataset.domain)}
                </Badge>
              </Table.Td>

              <Table.Td>
                <Text size="15px" c="dimmed">
                  {formatters.number(dataset.size)}
                </Text>
              </Table.Td>

              <Table.Td>
                <Badge
                  variant="light"
                  color={READINESS_COLORS[dataset.readiness] || 'gray'}
                  styles={BADGE_STYLES.readiness}
                >
                  {formatters.readiness(dataset.readiness)}
                </Badge>
              </Table.Td>

              <Table.Td>
                <Badge variant="light" color="gray" styles={BADGE_STYLES.storage}>
                  {formatters.storage(dataset.storage)}
                </Badge>
              </Table.Td>

              <Table.Td>
                <Text size="15px" c="dimmed">
                  {formatters.date(dataset.freshness || dataset.updated_at)}
                </Text>
              </Table.Td>

              <Table.Td>
                <Group gap={6}>
                  {dataset.tags.map(tag => (
                    <Badge key={tag} variant="light" color="gray" styles={BADGE_STYLES.tag}>
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </Table.Td>

              <Table.Td>
                <Tooltip label="Delete dataset">
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={e => handleDeleteClick(e, dataset.id, dataset.name)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
