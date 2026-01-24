import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { auth } = useAuthStore()

  // Fetch updated user data whenever the authenticated layout is loaded/reloaded
  const { data: userData, isSuccess } = useQuery({
    queryKey: ['user-data'],
    queryFn: async () => {
      const response = await api.get('/user/data-user')
      return response.data
    },
    // Only fetch if we have an access token
    enabled: !!auth.accessToken,
    // Refetch every 10 minutes
    refetchInterval: 10 * 60 * 1000,
    // Ensure it refetches even when the tab is not focused (optional, but good for real-time)
    refetchIntervalInBackground: true,
  })

  // Sync with auth store
  useEffect(() => {
    if (isSuccess && userData) {
      auth.setUser({
        id: userData._id,
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        email: userData.email,
        imagen: userData.imagen,
        business: userData.business,
        workcenter: userData.workcenter,
        role: userData.role,
        exp: auth.user?.exp || Date.now() + 24 * 60 * 60 * 1000,
      })
    }
  }, [isSuccess, userData])

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
