import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconPlus, IconSearch } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDatasets, useDeleteDataset } from '@/shared/hooks/useDatasets'
import { DatasetsTable } from './DatasetsTable'
import { ImportDatasetDrawer } from './ImportDatasetDrawer'

export function DatasetsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [domainFilter, setDomainFilter] = useState<string | null>(null)
  const [readinessFilter, setReadinessFilter] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [datasetToDelete, setDatasetToDelete] = useState<{
    id: string
    name: string
  } | null>(null)
  const [importDrawerOpen, setImportDrawerOpen] = useState(false)

  const filters = {
    search: searchQuery || undefined,
    domain:
      domainFilter && domainFilter !== 'All Domains'
        ? domainFilter.toLowerCase()
        : undefined,
    readiness:
      readinessFilter && readinessFilter !== 'All Readiness'
        ? readinessFilter.toLowerCase()
        : undefined,
  }

  const { data: datasets, isLoading, isError, error } = useDatasets(filters)
  const { mutate: deleteDataset, isPending: isDeleting } = useDeleteDataset()

  // Check URL params on mount to open import drawer
  useEffect(() => {
    if (searchParams.get('import') === 'true') {
      setImportDrawerOpen(true)
      // Remove the param from URL
      searchParams.delete('import')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const openDeleteModal = (id: string, name: string) => {
    setDatasetToDelete({ id, name })
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setDatasetToDelete(null)
  }

  const handleDelete = () => {
    if (!datasetToDelete) return

    deleteDataset(datasetToDelete.id, {
      onSuccess: () => {
        notifications.show({
          title: 'Dataset deleted',
          message: `"${datasetToDelete.name}" has been deleted successfully`,
          color: 'green',
        })
        closeDeleteModal()
      },
      onError: (error: Error) => {
        notifications.show({
          title: 'Delete failed',
          message: error.message || 'Failed to delete dataset',
          color: 'red',
        })
      },
    })
  }

  return (
    <Stack gap={0} style={{ height: '100vh', backgroundColor: '#FAFAFA' }}>
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
            onClick={() => setImportDrawerOpen(true)}
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

      <Box px={32} pb={24}>
        <Group gap={12}>
          <TextInput
            placeholder="Search datasets..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.currentTarget.value)}
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
            data={['All Domains', 'Tabular', 'Vision', 'Text', 'Audio']}
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
            data={[
              'All Readiness',
              'Ready',
              'Profiling',
              'Processing',
              'Draft',
              'Error',
            ]}
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

      {isError && (
        <Box px={32} pb={24}>
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error loading datasets"
            color="red"
          >
            {error instanceof Error
              ? error.message
              : 'Failed to fetch datasets from server'}
          </Alert>
        </Box>
      )}

      {isLoading && (
        <Box px={32}>
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
              <Loader size="lg" color="orange" />
              <Text size="15px" c="dimmed">
                Loading datasets...
              </Text>
            </Stack>
          </Box>
        </Box>
      )}

      {!isLoading && !isError && (
        <Box px={32}>
          <DatasetsTable datasets={datasets || []} onDelete={openDeleteModal} />
        </Box>
      )}

      <Modal
        opened={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Dataset"
        centered
        styles={{
          title: {
            fontSize: '18px',
            fontWeight: 600,
          },
        }}
      >
        <Stack gap="md">
          <Text size="15px">
            Are you sure you want to delete{' '}
            <Text component="span" fw={600}>
              {datasetToDelete?.name}
            </Text>
            ? This will permanently delete the dataset and all its files.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={isDeleting}
              styles={{
                root: {
                  backgroundColor: '#DC2626',
                },
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ImportDatasetDrawer
        opened={importDrawerOpen}
        onClose={() => setImportDrawerOpen(false)}
      />
    </Stack>
  )
}
