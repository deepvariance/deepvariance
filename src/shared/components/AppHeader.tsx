import { Group, Text, Avatar } from '@mantine/core'
import { IconUser } from '@tabler/icons-react'

export function AppHeader() {
  return (
    <Group
      h="100%"
      px={32}
      justify="space-between"
      style={{
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: 'white',
      }}
    >
      {/* Logo Section */}
      <Group gap={12}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#FF5C4D' }}>
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <Text size="16px" fw={600}>
          DeepVariance
        </Text>
      </Group>

      {/* User Section */}
      <Group gap={12}>
        <Avatar size={32} radius="xl" color="gray" variant="light">
          <IconUser size={18} />
        </Avatar>
        <Text size="15px" fw={500} c="#374151">
          Alex Chen
        </Text>
      </Group>
    </Group>
  )
}
