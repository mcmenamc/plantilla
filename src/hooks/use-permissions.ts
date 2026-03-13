import { useQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { useAuthStore } from '@/stores/auth-store'

export interface UserPermission {
    module: {
        _id: string
        nombre: string
        acciones: string[]
        icono: string
        orden: number
        padre: string
        estatus: string
        url: string
    }
    actions: string[]
}

export function usePermissions() {
    const { selectedWorkCenterId } = useWorkCenterStore()
    const { auth } = useAuthStore()
    const userId = auth.user?.id

    const { data: permissions = [], isLoading, isError, refetch } = useQuery<UserPermission[]>({
        queryKey: ['user-permissions', selectedWorkCenterId, userId, auth.user?.role],
        queryFn: async () => {
            if (!userId) return []

            const res = await api.get('/user/permissions', {
                params: { workCenterId: selectedWorkCenterId || undefined }
            })
            return res.data
        },
        enabled: !!userId,
        refetchOnWindowFocus: true,
        staleTime: 1000 * 60 * 1, // Reducido a 1 minuto para mayor reactividad
        retry: 1,
    })

    const location = useLocation()

    /**
     * Helper check if the user has a specific action in a given module.
     * @param action The specific action capability to verify (e.g. "Agregar")
     * @param moduleIdentifier Optional. The mapped 'url' (e.g. "/work-centers") or 'nombre' (e.g. "Clientes"). 
     *                         If not provided, it auto-detects based on the current URL.
     */
    const can = (action: string, moduleIdentifier?: string): boolean => {
        const identifier = moduleIdentifier || location.pathname

        const p = permissions.find(p => {
            const modUrl = p.module.url
            if (!modUrl) return p.module.nombre === identifier

            // Allow matching exact names, or matching if the current path starts with the module's url
            return (
                p.module.nombre === identifier ||
                (modUrl !== '/' && identifier.startsWith(modUrl)) ||
                (modUrl === '/' && identifier === '/')
            )
        })

        if (!p) return false
        return p.actions.includes(action)
    }

    /**
     * Helper check to verify if user has any access to a specific module at all.
     * @param moduleIdentifier The exactly mapped 'url' or 'nombre' of the sub-module
     */
    const canAccessModule = (moduleIdentifier: string): boolean => {
        const p = permissions.find(p => p.module.url === moduleIdentifier || p.module.nombre === moduleIdentifier)
        if (!p) return false
        return p.actions.length > 0
    }

    return {
        permissions,
        isLoading,
        isError,
        refetch,
        can,
        canAccessModule,
    }
}
