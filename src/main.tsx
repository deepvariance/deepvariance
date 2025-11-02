import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { App } from '@/app/App'
import { theme } from '@/shared/config/theme'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@/app/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </StrictMode>
)
