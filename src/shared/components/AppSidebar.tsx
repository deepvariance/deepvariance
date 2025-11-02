import { ROUTES } from '@/shared/config/constants'
import { COLORS } from '@/shared/config/colors'
import { useStore } from '@/shared/hooks/useStore'
import {
  Box,
  Group,
  Progress,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'
import {
  IconChevronLeft,
  IconDatabase,
  IconHome,
  IconStack2,
} from '@tabler/icons-react'
import { useLocation, useNavigate } from 'react-router-dom'

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar } = useStore()

  const navItems = [
    { label: 'Start', icon: IconHome, path: ROUTES.HOME },
    { label: 'Models', icon: IconStack2, path: ROUTES.MODELS },
    { label: 'Datasets', icon: IconDatabase, path: ROUTES.DATASETS },
  ]

  return (
    <Box
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRight: `1px solid ${COLORS.GRAY_200}`,
      }}
    >
      <Stack gap={0} style={{ flex: 1 }}>
        {/* Navigation Links */}
        <Box px={12} pt={16} style={{ flex: 1 }}>
          <Stack gap={4}>
            {navItems.map(item => {
              const Icon = item.icon
              // Use startsWith for child routes, exact match for home
              const isActive = item.path === ROUTES.HOME
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path)

              return (
                <UnstyledButton
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    width: '100%',
                    padding: sidebarOpen ? '10px 12px' : '10px',
                    borderRadius: 8,
                    backgroundColor: isActive ? COLORS.PRIMARY_LIGHT : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    display: 'flex',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = COLORS.GRAY_50
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Group gap={12}>
                    <Icon
                      size={20}
                      color={isActive ? COLORS.PRIMARY : COLORS.GRAY_500}
                      style={{ flexShrink: 0 }}
                    />
                    {sidebarOpen && (
                      <Text
                        size="15px"
                        fw={isActive ? 500 : 400}
                        style={{ color: isActive ? COLORS.PRIMARY : COLORS.GRAY_700 }}
                      >
                        {item.label}
                      </Text>
                    )}
                  </Group>
                </UnstyledButton>
              )
            })}
          </Stack>
        </Box>

        {/* System Monitor Section */}
        <Box px={sidebarOpen ? 20 : 12} py={20} style={{ borderTop: `1px solid ${COLORS.GRAY_200}` }}>
          {sidebarOpen && (
            <Text
              size="11px"
              fw={600}
              c={COLORS.GRAY_500}
              mb={16}
              tt="uppercase"
              style={{ letterSpacing: '0.5px' }}
            >
              System
            </Text>
          )}
          {sidebarOpen ? (
            <Stack gap={16}>
              <Box>
                <Group justify="space-between" mb={8}>
                  <Text size="13px" c={COLORS.GRAY_500}>
                    CPU
                  </Text>
                  <Text size="13px" fw={600} c={COLORS.GRAY_700}>
                    51°C
                  </Text>
                </Group>
                <Group justify="space-between" mb={6}>
                  <Text size="11px" c={COLORS.GRAY_400}>
                    16.2 / 16 GB
                  </Text>
                  <Text size="11px" fw={600} c={COLORS.WARNING}>
                    42%
                  </Text>
                </Group>
                <Progress
                  value={42}
                  size="sm"
                  radius="xl"
                  styles={{
                    root: { backgroundColor: COLORS.GRAY_100 },
                    section: { backgroundColor: COLORS.WARNING },
                  }}
                />
              </Box>

              <Box>
                <Group justify="space-between" mb={8}>
                  <Text size="13px" c={COLORS.GRAY_500}>
                    GPU
                  </Text>
                  <Text size="13px" fw={600} c={COLORS.GRAY_700}>
                    8.7 / 16 GB
                  </Text>
                </Group>
                <Group justify="space-between" mb={6}>
                  <Text size="11px" c={COLORS.GRAY_400}>
                    71°C
                  </Text>
                  <Group gap={6}>
                    <Box
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: COLORS.SUCCESS,
                      }}
                    />
                    <Text size="11px" fw={600} c={COLORS.SUCCESS}>
                      68%
                    </Text>
                  </Group>
                </Group>
                <Progress
                  value={68}
                  size="sm"
                  radius="xl"
                  styles={{
                    root: { backgroundColor: COLORS.GRAY_100 },
                    section: { backgroundColor: COLORS.SUCCESS },
                  }}
                />
              </Box>
            </Stack>
          ) : (
            <Stack gap={12} align="center">
              <Box style={{ width: '100%' }}>
                <Progress
                  value={42}
                  size="xs"
                  radius="xl"
                  styles={{
                    root: { backgroundColor: COLORS.GRAY_100 },
                    section: { backgroundColor: COLORS.WARNING },
                  }}
                />
              </Box>
              <Box style={{ width: '100%' }}>
                <Progress
                  value={68}
                  size="xs"
                  radius="xl"
                  styles={{
                    root: { backgroundColor: COLORS.GRAY_100 },
                    section: { backgroundColor: COLORS.SUCCESS },
                  }}
                />
              </Box>
            </Stack>
          )}

          {/* Collapse Button */}
          <UnstyledButton
            onClick={toggleSidebar}
            mt={16}
            style={{
              width: '100%',
              padding: sidebarOpen ? '8px 12px' : '8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#F9FAFB'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title={!sidebarOpen ? 'Expand' : 'Collapse'}
          >
            <IconChevronLeft
              size={16}
              color={COLORS.GRAY_500}
              style={{
                transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.3s ease',
              }}
            />
            {sidebarOpen && (
              <Text size="13px" c={COLORS.GRAY_500}>
                Collapse
              </Text>
            )}
          </UnstyledButton>
        </Box>
      </Stack>
    </Box>
  )
}
