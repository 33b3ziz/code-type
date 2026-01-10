import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'
import { LiveAnnouncerProvider } from '../components/LiveAnnouncer'
import { ThemeProvider } from '../components/ThemeProvider'
import { NotificationProvider } from '../components/Notifications'
import { SkipLink } from '../components/SkipLink'
import { ErrorBoundary } from '../components/ui/error-boundary'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

// Inline script to prevent flash of unstyled content
const themeScript = `
(function() {
  var theme = localStorage.getItem('codetype-theme') || 'dark';
  var resolved = theme;
  if (theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.classList.add(resolved);
})();
`

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'CodeType - Code Typing Practice',
      },
    ],
    links: [
      // Preconnect to Google Fonts for faster font loading
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      // JetBrains Mono font for code display, Exo 2 for headings
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider defaultTheme="dark">
          <NotificationProvider>
            <LiveAnnouncerProvider>
              <SkipLink />
              <Header />
              <main id="main-content">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  TanStackQueryDevtools,
                ]}
              />
            </LiveAnnouncerProvider>
          </NotificationProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
