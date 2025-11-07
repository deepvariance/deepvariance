import { COLORS } from '@/shared/config/colors'
import { ROUTES } from '@/shared/config/constants'
import { useStore } from '@/shared/hooks/useStore'
import {
  Box,
  Progress,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import {
  IconChartDots,
  IconChartLine,
  IconChevronLeft,
  IconDatabase,
  IconHome,
  IconPlugConnected,
  IconRocket,
  IconStack2,
} from '@tabler/icons-react'
import { useLocation, useNavigate } from 'react-router-dom'

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar } = useStore()

  const navStructure = [
    {
      type: 'single' as const,
      label: 'Home',
      icon: IconHome,
      path: ROUTES.HOME,
    },
    {
      type: 'category' as const,
      label: 'TRAINING',
      items: [
        { label: 'Models', icon: IconStack2, path: ROUTES.MODELS },
        { label: 'Deployments', icon: IconRocket, path: '/deployments' },
      ],
    },
    {
      type: 'category' as const,
      label: 'DATA MANAGEMENT',
      items: [
        { label: 'Datasets', icon: IconDatabase, path: ROUTES.DATASETS },
        {
          label: 'Data Sources',
          icon: IconPlugConnected,
          path: '/data-sources',
        },
      ],
    },
    {
      type: 'category' as const,
      label: 'ANALYTICS',
      items: [
        {
          label: 'Model Performance',
          icon: IconChartLine,
          path: '/model-performance',
        },
        { label: 'Usage Metrics', icon: IconChartDots, path: '/usage-metrics' },
      ],
    },
  ]

  const renderNavItem = (
    item: { label: string; icon: typeof IconHome; path: string },
    key: string
  ) => {
    const Icon = item.icon
    const isActive =
      item.path === ROUTES.HOME
        ? location.pathname === item.path
        : location.pathname.startsWith(item.path)

    const navButton = (
      <UnstyledButton
        key={key}
        onClick={() => navigate(item.path)}
        style={{
          width: '100%',
          padding: '10px 16px 10px 16px',
          borderRadius: '0 12px 12px 0',
          backgroundColor: isActive ? 'white' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'flex-start',
          marginLeft: '0',
          boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
          borderTop: isActive ? '1px solid #E5E7EB' : '1px solid transparent',
          borderRight: isActive ? '1px solid #E5E7EB' : '1px solid transparent',
          borderBottom: isActive
            ? '1px solid #E5E7EB'
            : '1px solid transparent',
          borderLeft: 'none',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
            e.currentTarget.style.borderTop =
              '1px solid rgba(229, 231, 235, 0.5)'
            e.currentTarget.style.borderRight =
              '1px solid rgba(229, 231, 235, 0.5)'
            e.currentTarget.style.borderBottom =
              '1px solid rgba(229, 231, 235, 0.5)'
            e.currentTarget.style.borderLeft = 'none'
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderTop = '1px solid transparent'
            e.currentTarget.style.borderRight = '1px solid transparent'
            e.currentTarget.style.borderBottom = '1px solid transparent'
            e.currentTarget.style.borderLeft = 'none'
          }
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginLeft: '12px',
          }}
        >
          <Icon
            size={20}
            color={isActive ? COLORS.PRIMARY : COLORS.GRAY_500}
            style={{ flexShrink: 0 }}
          />
          {sidebarOpen && (
            <Text
              size="15px"
              fw={isActive ? 600 : 400}
              style={{
                color: isActive ? COLORS.PRIMARY : COLORS.GRAY_700,
              }}
            >
              {item.label}
            </Text>
          )}
        </Box>
      </UnstyledButton>
    )

    // Wrap with Tooltip when sidebar is collapsed
    if (!sidebarOpen) {
      return (
        <Tooltip
          key={key}
          label={item.label}
          position="right"
          withArrow
          offset={12}
          styles={{
            tooltip: {
              fontSize: '14px',
              fontWeight: 500,
              padding: '8px 12px',
            },
          }}
        >
          {navButton}
        </Tooltip>
      )
    }

    return navButton
  }

  return (
    <Box
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FAFAFA',
        borderRight: 'none',
      }}
    >
      <Stack gap={0} style={{ flex: 1, overflow: 'hidden' }}>
        {/* Navigation Links */}
        <Box
          px={0}
          pt={16}
          pb={16}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Stack gap={0} pr={16}>
            {navStructure.map((section, sectionIndex) => {
              if (section.type === 'single') {
                return renderNavItem(section, `single-${sectionIndex}`)
              }

              // Category with items
              return (
                <Box
                  key={`category-${sectionIndex}`}
                  mt={sectionIndex === 0 ? 0 : 16}
                >
                  {sidebarOpen && (
                    <Text
                      size="11px"
                      fw={600}
                      c={COLORS.GRAY_500}
                      mb={8}
                      pl={12}
                      style={{ letterSpacing: '0.8px' }}
                    >
                      {section.label}
                    </Text>
                  )}
                  <Stack gap={4}>
                    {section.items.map((item, itemIndex) =>
                      renderNavItem(
                        item,
                        `category-${sectionIndex}-item-${itemIndex}`
                      )
                    )}
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        </Box>

        {/* System Monitor Section */}
        <Box px={sidebarOpen ? 20 : 12} py={20} style={{ borderTop: 'none' }}>
          {sidebarOpen && (
            <Text
              size="11px"
              fw={600}
              c={COLORS.GRAY_500}
              mb={16}
              style={{ letterSpacing: '0.8px' }}
            >
              SYSTEM
            </Text>
          )}
          {sidebarOpen ? (
            <Stack gap={16}>
              <Box>
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text size="13px" c={COLORS.GRAY_500}>
                    CPU
                  </Text>
                  <Text size="13px" fw={600} c={COLORS.GRAY_700}>
                    51°C
                  </Text>
                </Box>
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <Text size="11px" c={COLORS.GRAY_400}>
                    16.2 / 16 GB
                  </Text>
                  <Text size="11px" fw={600} c={COLORS.WARNING}>
                    42%
                  </Text>
                </Box>
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
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text size="13px" c={COLORS.GRAY_500}>
                    GPU
                  </Text>
                  <Text size="13px" fw={600} c={COLORS.GRAY_700}>
                    8.7 / 16 GB
                  </Text>
                </Box>
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <Text size="11px" c={COLORS.GRAY_400}>
                    71°C
                  </Text>
                  <Box
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
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
                  </Box>
                </Box>
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
          <Tooltip
            label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            position="right"
            withArrow
            offset={12}
            styles={{
              tooltip: {
                fontSize: '13px',
                fontWeight: 500,
                padding: '6px 10px',
              },
            }}
          >
            <UnstyledButton
              onClick={toggleSidebar}
              mt={16}
              style={{
                width: sidebarOpen ? '36px' : '100%',
                height: '36px',
                padding: 0,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: 'white',
                border: `1px solid ${COLORS.GRAY_200}`,
                marginLeft: sidebarOpen ? 'auto' : 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = COLORS.GRAY_50
                e.currentTarget.style.borderColor = COLORS.GRAY_400
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = COLORS.GRAY_200
              }}
            >
              <IconChevronLeft
                size={18}
                color={COLORS.GRAY_700}
                style={{
                  transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </UnstyledButton>
          </Tooltip>
        </Box>
      </Stack>
    </Box>
  )
}
