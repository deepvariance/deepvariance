import {
  Button,
  Drawer,
  FileInput,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { IconUpload } from '@tabler/icons-react'
import { useState } from 'react'
import { useCreateDataset } from '@/shared/hooks/useDatasets'
import { notifications } from '@mantine/notifications'

interface ImportDatasetDrawerProps {
  opened: boolean
  onClose: () => void
}

export function ImportDatasetDrawer({ opened, onClose }: ImportDatasetDrawerProps) {
  const [importName, setImportName] = useState('')
  const [importDomain, setImportDomain] = useState<string | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importTags, setImportTags] = useState('')
  const [importDescription, setImportDescription] = useState('')

  const { mutate: createDataset, isPending: isCreating } = useCreateDataset()

  const handleImport = () => {
    if (!importName || !importDomain || !importFile) {
      notifications.show({
        title: 'Validation error',
        message: 'Please fill in all required fields',
        color: 'red',
      })
      return
    }

    const formData = new FormData()
    formData.append('name', importName)
    formData.append('domain', importDomain)
    formData.append('file', importFile)
    if (importTags) {
      formData.append('tags', importTags)
    }
    if (importDescription) {
      formData.append('description', importDescription)
    }

    createDataset(formData, {
      onSuccess: () => {
        notifications.show({
          title: 'Dataset imported',
          message: `"${importName}" has been imported successfully`,
          color: 'green',
        })
        // Reset form
        setImportName('')
        setImportDomain(null)
        setImportFile(null)
        setImportTags('')
        setImportDescription('')
        onClose()
      },
      onError: error => {
        notifications.show({
          title: 'Import failed',
          message: error instanceof Error ? error.message : 'Failed to import dataset',
          color: 'red',
        })
      },
    })
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      title="Import Dataset"
      size="md"
      styles={{
        title: {
          fontSize: '20px',
          fontWeight: 600,
        },
      }}
    >
      <Stack gap="lg">
        <Text size="15px" c="dimmed">
          Upload your dataset files. Large files (up to 100GB) are supported.
        </Text>

        <TextInput
          label="Dataset Name"
          placeholder="Enter dataset name"
          required
          value={importName}
          onChange={e => setImportName(e.currentTarget.value)}
          styles={{
            label: { fontSize: '14px', fontWeight: 500, marginBottom: 8 },
            input: { fontSize: '15px' },
          }}
        />

        <Select
          label="Domain"
          placeholder="Select domain"
          required
          value={importDomain}
          onChange={setImportDomain}
          data={[
            { value: 'vision', label: 'Vision' },
            { value: 'tabular', label: 'Tabular' },
            { value: 'text', label: 'Text' },
            { value: 'audio', label: 'Audio' },
          ]}
          styles={{
            label: { fontSize: '14px', fontWeight: 500, marginBottom: 8 },
            input: { fontSize: '15px' },
          }}
        />

        <FileInput
          label="Dataset File"
          placeholder="Upload file or ZIP archive"
          required
          value={importFile}
          onChange={setImportFile}
          leftSection={<IconUpload size={16} />}
          accept=".zip,.csv,.json,.txt,image/*"
          styles={{
            label: { fontSize: '14px', fontWeight: 500, marginBottom: 8 },
            input: { fontSize: '15px' },
          }}
        />

        <TextInput
          label="Tags"
          placeholder="Enter comma-separated tags (optional)"
          value={importTags}
          onChange={e => setImportTags(e.currentTarget.value)}
          styles={{
            label: { fontSize: '14px', fontWeight: 500, marginBottom: 8 },
            input: { fontSize: '15px' },
          }}
        />

        <Textarea
          label="Description"
          placeholder="Enter dataset description (optional)"
          value={importDescription}
          onChange={e => setImportDescription(e.currentTarget.value)}
          minRows={3}
          styles={{
            label: { fontSize: '14px', fontWeight: 500, marginBottom: 8 },
            input: { fontSize: '15px' },
          }}
        />

        <Group justify="flex-end" gap="sm" mt="xl">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            loading={isCreating}
            leftSection={<IconUpload size={16} />}
            styles={{
              root: {
                backgroundColor: '#FF5C4D',
              },
            }}
          >
            Import Dataset
          </Button>
        </Group>
      </Stack>
    </Drawer>
  )
}
