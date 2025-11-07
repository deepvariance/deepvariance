import {
  Button,
  Modal,
  FileInput,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Progress,
  Alert,
} from '@mantine/core'
import { IconUpload, IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { useCreateDataset } from '@/shared/hooks/useDatasets'
import { notifications } from '@mantine/notifications'
import axios from 'axios'

interface ImportDatasetModalProps {
  opened: boolean
  onClose: () => void
}

export function ImportDatasetModal({ opened, onClose }: ImportDatasetModalProps) {
  const [importName, setImportName] = useState('')
  const [importDomain, setImportDomain] = useState<string | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importTags, setImportTags] = useState('')
  const [importDescription, setImportDescription] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  const handleUploadProgress = (progressEvent: any) => {
    if (progressEvent.total) {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setUploadProgress(progress)
    }
  }

  const { mutate: createDataset, isPending: isCreating } = useCreateDataset(handleUploadProgress)

  const handleImport = () => {
    // Clear previous errors
    setErrorMessage('')
    setUploadProgress(0)

    if (!importName || !importDomain || !importFile) {
      setErrorMessage('Please fill in all required fields')
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
        setUploadProgress(0)
        setErrorMessage('')
        onClose()
      },
      onError: error => {
        // Extract error message from axios error
        let errorMsg = 'Failed to import dataset'
        if (axios.isAxiosError(error) && error.response?.data?.detail) {
          errorMsg = error.response.data.detail
        } else if (error instanceof Error) {
          errorMsg = error.message
        }
        setErrorMessage(errorMsg)
        setUploadProgress(0)
      },
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Import Dataset"
      size="lg"
      centered
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

        {errorMessage && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Import Failed"
            color="red"
            variant="light"
            withCloseButton
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}

        {isCreating && uploadProgress > 0 && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Uploading dataset...
              </Text>
              <Text size="sm" c="dimmed">
                {uploadProgress}%
              </Text>
            </Group>
            <Progress value={uploadProgress} size="sm" color="orange" animated />
          </Stack>
        )}

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
          ]}
          description="Only Vision and Tabular datasets are currently supported"
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

        <Group justify="flex-end" gap="sm" mt="md">
          <Button
            variant="light"
            color="gray"
            onClick={onClose}
            disabled={isCreating}
            styles={{
              root: {
                fontSize: '15px',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            loading={isCreating}
            leftSection={!isCreating && <IconUpload size={16} />}
            color="orange"
            styles={{
              root: {
                backgroundColor: '#FF5C4D',
                fontSize: '15px',
              },
            }}
          >
            Import Dataset
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
