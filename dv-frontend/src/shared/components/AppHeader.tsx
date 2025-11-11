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
      <Group gap={10} align="center">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <defs>
            <linearGradient id="triangleGradient" x1="18" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          {/* Triangle with gradient fill */}
          <path
            d="M18 6L30 30H6L18 6Z"
            fill="url(#triangleGradient)"
          />
          {/* Performance graph line inside triangle */}
          <path
            d="M10 24L14 19L17 21L21 16L26 20"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.9"
          />
        </svg>
        <Text size="22px" fw={400} style={{ letterSpacing: '-0.5px' }}>
          <Text component="span" fw={700} inherit>
            deep
          </Text>
          <Text component="span" fw={300} inherit>
            variance
          </Text>
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
