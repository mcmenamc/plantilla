import { createFileRoute, redirect } from '@tanstack/react-router'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { getWorkCenters } from '@/features/work-centers/data/work-centers-api'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location, context, preload }: { location: any, context: any, preload: boolean }) => {
    const { queryClient } = context
    const { accessToken, user } = useAuthStore.getState().auth

    if (!accessToken || !user) {
      if (preload) return
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }



    // Get the updated token (it might have changed after refreshToken)
    const currentToken = useAuthStore.getState().auth.accessToken
    const decoded: any = jwtDecode(currentToken)
    const hasBusiness = !!decoded.businessId || !!user.business



    if (!hasBusiness && user.role === 'Admin') {
      const isConfigPage = location.pathname === '/configurar-cuenta'

      if (!isConfigPage) {
        throw redirect({
          to: '/configurar-cuenta',
        })
      }
      return // Permitir permanecer en la página de configuración
    }

    // Validación de centros de trabajo
    if (hasBusiness && user.role === 'Admin') {
      const isWorkCenterAddPage = location.pathname === '/work-centers/add'
      const isConfigPage = location.pathname === '/configurar-cuenta'

      if (!isWorkCenterAddPage && !isConfigPage) {
        try {
          // Use TanStack Query to manage fetching and caching
          const workCenters: any[] = await queryClient.ensureQueryData({
            queryKey: ['work-centers'],
            queryFn: getWorkCenters,
          })

          if (workCenters.length === 0) {
            toast.error('Para continuar debes registrar un centro de trabajo primero', {
              id: 'no-work-centers-error' // Evita duplicados
            })
            throw redirect({
              to: '/work-centers/add',
            })
          }
        } catch (error: any) {
          // Si es un redirect de TanStack o tiene la estructura de uno, relanzarlo
          if (error && (error.isRedirect || error.to || error.status === 307 || error.status === 302)) {
            throw error
          }
          console.error('Error al verificar centros de trabajo:', error)
        }
      }
    }
  },
  pendingComponent: () => (
    <AuthenticatedLayout>
      <div className="flex flex-1 items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando interfaz...</p>
      </div>
    </AuthenticatedLayout>
  ),
  component: AuthenticatedLayout,
})
