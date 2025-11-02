import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@mantine/core'
import { AppSidebar } from '@/shared/components/AppSidebar'
import { AppHeader } from '@/shared/components/AppHeader'
import { AppRoutes } from './routes'
import { queryClient } from '@/shared/config/queryClient'
import { useStore } from '@/shared/hooks/useStore'

export function App() {
  const sidebarOpen = useStore((state) => state.sidebarOpen)

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: sidebarOpen ? 200 : 80,
            breakpoint: 'sm',
          }}
          padding={0}
        >
          <AppShell.Header>
            <AppHeader />
          </AppShell.Header>

          <AppShell.Navbar>
            <AppSidebar />
          </AppShell.Navbar>

          <AppShell.Main
            style={{
              backgroundColor: '#FAFAFA',
              minHeight: 'calc(100vh - 60px)',
            }}
          >
            <AppRoutes />
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
