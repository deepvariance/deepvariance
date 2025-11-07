import { Box, Container, Stack, Text, Title } from '@mantine/core'

interface ComingSoonProps {
  title?: string
  description?: string
}

export function ComingSoon({
  title = 'Coming Soon',
  description = "We're working hard to bring you this feature. Stay tuned!",
}: ComingSoonProps) {
  return (
    <Container size="md" style={{ height: '100%' }}>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        <Stack align="center" gap={32}>
          <Box
            component="img"
            src="/work-in-progress.png"
            alt="Coming Soon"
            style={{
              width: '100%',
              maxWidth: 250,
              height: 'auto',
            }}
          />
          <Stack align="center" gap={12}>
            <Title
              order={2}
              style={{ fontSize: 32, fontWeight: 600, color: '#111827' }}
            >
              {title}
            </Title>
            <Text size="16px" c="#6B7280" ta="center" maw={500}>
              {description}
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}
