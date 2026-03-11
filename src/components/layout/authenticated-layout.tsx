import { useEffect } from 'react'
import { Outlet, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import { useFont } from '@/context/font-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { NotificationInitializer } from '@/components/notifications/notification-initializer'
import { WhatsappSupport } from '@/components/whatsapp-support'
import { toast } from 'sonner'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const { font, setFont } = useFont()

  // Fetch updated user data whenever the authenticated layout is loaded/reloaded
  const { data: userData, isSuccess, isError } = useQuery({
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

  // Handle API validation errors (e.g., token expired or revoked)
  useEffect(() => {
    if (isError) {
      toast.error('La sesión ha expirado o hubo un problema al validar el usuario.')
      const currentPath = location.href
      auth.reset()
      navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    }
  }, [isError, navigate, auth])

  // Sync with auth store and contexts
  useEffect(() => {
    if (isSuccess && userData) {
      // Apply theme and font if they differ from current state
      if (userData.theme && userData.theme !== theme) {
        setTheme(userData.theme)
      }
      if (userData.font && userData.font !== font) {
        setFont(userData.font)
      }

      auth.setUser({
        id: userData._id,
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        email: userData.email,
        imagen: userData.imagen,
        business: userData.business,
        workcenters: userData.workcenters,
        role: userData.role,
        regimenFiscal: userData.regimenFiscal,
        tipoPersona: userData.tipoPersona,
        theme: userData.theme,
        font: userData.font,
        exp: auth.user?.exp || Date.now() + 24 * 60 * 60 * 1000,
      })
      // si el usuario no tiene workcenters y es user, redirigir a sign-in
      if (userData.workcenters.length == 0 && auth.user?.role == 'User') {
        toast.error('No tienes workcenters asignados')
        const currentPath = location.href
        // eliminar sesion
        auth.reset()
        navigate({
          to: '/sign-in',
          search: { redirect: currentPath },
          replace: true,
        })
      }
    }
  }, [isSuccess, userData])

  // Refresh token only on initial mount (page reload)
  useEffect(() => {
    const performInitialRefresh = async () => {
      try {
        await auth.refreshToken()
      } catch (error) {
        console.error('Initial session refresh failed:', error)
      }
    }
    performInitialRefresh()
  }, []) // Empty dependency array means it only runs once on mount

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <NotificationInitializer />
          <WhatsappSupport />
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
