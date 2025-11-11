import {
  Alert,
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconAlertCircle, IconChevronRight, IconDatabase } from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDataset } from '../../shared/hooks/useDatasets'
import { formatters } from '../../shared/utils/formatters'
import { DOMAIN_COLORS, READINESS_COLORS, BADGE_STYLES } from '../../shared/constants/theme'

interface BreadcrumbItem {
  title: string
  onClick?: () => void
}

function DatasetBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Breadcrumbs separator={<IconChevronRight size={14} color="#9CA3AF" />}>
      {items.map((item, index) => {
        const isCurrentPage = !item.onClick

        if (isCurrentPage) {
          return (
            <Text
              key={index}
              size="14px"
              c="#6B7280"
              fw={500}
            >
              {item.title}
            </Text>
          )
        }

        return (
          <Anchor
            key={index}
            onClick={item.onClick}
            style={{
              cursor: 'pointer',
              color: '#6366F1',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            {item.title}
          </Anchor>
        )
      })}
    </Breadcrumbs>
  )
}

function LoadingState() {
  return (
    <Stack gap={0} style={{ height: '100vh', backgroundColor: '#FAFAFA' }}>
      <Box px={32} pt={40}>
        <Box
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            padding: 60,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack align="center" gap={16}>
            <Loader size="lg" color="indigo" />
            <Text size="15px" c="dimmed">
              Loading dataset details...
            </Text>
          </Stack>
        </Box>
      </Box>
    </Stack>
  )
}

function ErrorState({ error, onBack }: { error: Error | null; onBack: () => void }) {
  return (
    <Stack gap={0} style={{ height: '100vh', backgroundColor: '#FAFAFA' }}>
      <Box px={32} pt={40}>
        <Alert icon={<IconAlertCircle size={16} />} title="Error loading dataset" color="red">
          {error instanceof Error ? error.message : 'Dataset not found'}
        </Alert>
        <Button mt={16} onClick={onBack}>
          Back to Datasets
        </Button>
      </Box>
    </Stack>
  )
}

interface InfoRowProps {
  label: string
  value: React.ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Group justify="space-between">
      <Text size="14px" c="dimmed">
        {label}
      </Text>
      {typeof value === 'string' ? <Text size="14px" fw={500}>{value}</Text> : value}
    </Group>
  )
}

interface InfoCardProps {
  title: string
  children: React.ReactNode
}

function InfoCard({ title, children }: InfoCardProps) {
  return (
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
      <Title order={3} size={18} fw={600} mb={20}>
        {title}
      </Title>
      {children}
    </Card>
  )
}

export function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: dataset, isLoading, isError, error } = useDataset(id || '')

  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Datasets', onClick: () => navigate('/datasets') },
    { title: dataset?.name || 'Loading...' },
  ]

  if (isLoading) {
    return <LoadingState />
  }

  if (isError || !dataset) {
    return <ErrorState error={error} onBack={() => navigate('/datasets')} />
  }

  return (
    <Stack gap={0} style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Breadcrumbs */}
      <Box px={32} pt={24} pb={16}>
        <DatasetBreadcrumbs items={breadcrumbItems} />
      </Box>

      {/* Header */}
      <Box px={32} pb={24}>
        <Group gap={16} align="flex-start">
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: '#D4F4DD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconDatabase size={24} color="#22C55E" />
          </Box>
          <Stack gap={4} style={{ flex: 1 }}>
            <Title order={1} size={28} fw={700}>
              {dataset.name}
            </Title>
            {dataset.description && (
              <Text size="15px" c="dimmed">
                {dataset.description}
              </Text>
            )}
          </Stack>
        </Group>
      </Box>

      {/* Content */}
      <Box px={32} pb={32}>
        <Stack gap={24}>
          {/* Overview Card */}
          <InfoCard title="Overview">
            <Stack gap={16}>
              <InfoRow
                label="Domain"
                value={
                  <Badge
                    variant="light"
                    color={DOMAIN_COLORS[dataset.domain] || 'gray'}
                    styles={BADGE_STYLES.domain}
                  >
                    {formatters.domain(dataset.domain)}
                  </Badge>
                }
              />
              <InfoRow
                label="Readiness"
                value={
                  <Badge
                    variant="light"
                    color={READINESS_COLORS[dataset.readiness] || 'gray'}
                    styles={BADGE_STYLES.readiness}
                  >
                    {formatters.readiness(dataset.readiness)}
                  </Badge>
                }
              />
              <InfoRow
                label="Storage"
                value={
                  <Badge variant="light" color="gray" styles={BADGE_STYLES.storage}>
                    {formatters.storage(dataset.storage)}
                  </Badge>
                }
              />
              <InfoRow label="Files" value={formatters.number(dataset.size)} />
              <InfoRow
                label="Path"
                value={
                  <Text size="14px" fw={500} style={{ fontFamily: 'monospace' }}>
                    {dataset.path}
                  </Text>
                }
              />
            </Stack>
          </InfoCard>

          {/* Tags Card */}
          {dataset.tags?.length > 0 && (
            <InfoCard title="Tags">
              <Group gap={8}>
                {dataset.tags.map(tag => (
                  <Badge key={tag} variant="light" color="gray" styles={BADGE_STYLES.tag}>
                    {tag}
                  </Badge>
                ))}
              </Group>
            </InfoCard>
          )}

          {/* Metadata Card */}
          <InfoCard title="Metadata">
            <Stack gap={16}>
              <InfoRow label="Created" value={formatters.dateTime(dataset.created_at)} />
              <InfoRow label="Last Updated" value={formatters.dateTime(dataset.updated_at)} />
              {dataset.freshness && (
                <InfoRow label="Freshness" value={formatters.dateTime(dataset.freshness)} />
              )}
              <InfoRow
                label="Dataset ID"
                value={
                  <Text size="13px" fw={500} c="dimmed" style={{ fontFamily: 'monospace' }}>
                    {dataset.id}
                  </Text>
                }
              />
            </Stack>
          </InfoCard>
        </Stack>
      </Box>
    </Stack>
  )
}
