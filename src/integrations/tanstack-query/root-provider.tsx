import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Query client configuration constants
const FIVE_MINUTES = 1000 * 60 * 5
const THIRTY_MINUTES = 1000 * 60 * 30

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES, // Data considered fresh for 5 minutes
        gcTime: THIRTY_MINUTES, // Garbage collection after 30 minutes
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnReconnect: true, // Refetch on reconnect
        retry: 1, // Only retry failed requests once
      },
      mutations: {
        retry: 0, // Don't retry mutations
      },
    },
  })
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
