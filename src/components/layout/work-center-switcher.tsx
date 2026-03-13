import * as React from 'react'
import { ChevronsUpDown, Plus, Building2, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { getWorkCenters } from '@/features/work-centers/data/work-centers-api'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuthStore } from '@/stores/auth-store'

export function WorkCenterSwitcher() {
  const { auth: { user: currentUser } } = useAuthStore()
  const isRoot = currentUser?.role === 'Root'
  const { can } = usePermissions()
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { selectedWorkCenterId, setSelectedWorkCenterId } = useWorkCenterStore()

  const { data: workCenters = [], isLoading } = useQuery({
    queryKey: ['work-centers'],
    queryFn: getWorkCenters,
  })

  const activeWorkCenters = React.useMemo(() =>
    workCenters?.filter(wc => wc?.estatus === 'Activo'),
    [workCenters])

  const activeWorkCenter = React.useMemo(() => {
    if (activeWorkCenters.length === 0) return null
    if (activeWorkCenters.length === 1) {
      // If only one, select it automatically if not already set or mismatch
      if (selectedWorkCenterId !== activeWorkCenters[0]._id) {
        // We defer the state update to avoid side effects during render
      }
      return activeWorkCenters[0]
    }

    return activeWorkCenters.find(wc => wc._id === selectedWorkCenterId) || activeWorkCenters[0]
  }, [activeWorkCenters, selectedWorkCenterId])

  // Sync selected ID if needed
  React.useEffect(() => {
    if (activeWorkCenter && selectedWorkCenterId !== activeWorkCenter._id) {
      setSelectedWorkCenterId(activeWorkCenter._id)
    }
  }, [activeWorkCenter, selectedWorkCenterId, setSelectedWorkCenterId])

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Building2 className='size-4 animate-pulse' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>Cargando...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!activeWorkCenter) {
    if (isRoot) return null
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' onClick={() => navigate({ to: '/work-centers/add' })}>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Plus className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>Añadir Centro</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div
                key={`logo-${activeWorkCenter._id}`}
                className='flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden border border-border bg-white shadow-sm shrink-0 animate-in fade-in zoom-in-95 duration-300'
              >
                {activeWorkCenter.imagen ? (
                  <img
                    src={activeWorkCenter.imagen}
                    alt={activeWorkCenter.workcenterName}
                    className='size-full object-cover'
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement?.classList.add('bg-primary')
                    }}
                  />
                ) : (
                  <div className='bg-primary text-primary-foreground flex size-full items-center justify-center'>
                    <Building2 className='size-4' />
                  </div>
                )}
              </div>
              <div
                key={`info-${activeWorkCenter._id}`}
                className='grid flex-1 text-start text-sm leading-tight ml-2 animate-in fade-in slide-in-from-left-2 duration-300'
              >
                <span className='truncate font-semibold'>
                  {activeWorkCenter.workcenterName}
                </span>
                <span className='truncate text-xs text-muted-foreground'>{activeWorkCenter.rfc}</span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Centros de Trabajo
            </DropdownMenuLabel>
            {activeWorkCenters.map((wc) => (
              <DropdownMenuItem
                key={wc._id}
                onClick={() => setSelectedWorkCenterId(wc._id)}
                className={`gap-2 p-2 cursor-pointer ${selectedWorkCenterId === wc._id ? 'bg-accent text-accent-foreground font-medium' : ''}`}
              >
                <div className='flex size-8 shrink-0 items-center justify-center rounded-md border bg-white overflow-hidden shadow-sm'>
                  {wc.imagen ? (
                    <img
                      src={wc.imagen}
                      alt={wc.workcenterName}
                      className='size-full object-cover'
                    />
                  ) : (
                    <Building2 className='size-4 shrink-0 text-muted-foreground' />
                  )}
                </div>
                <div className='flex flex-col min-w-0'>
                  <span className='text-sm font-medium truncate'>{wc.workcenterName}</span>
                  <span className='text-xs text-muted-foreground truncate'>{wc.rfc}</span>
                </div>
                {selectedWorkCenterId === wc._id && (
                  <Check className='ms-auto size-4 shrink-0 opacity-100' />
                )}
              </DropdownMenuItem>
            ))}
            {can('Agregar') && !isRoot && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='gap-2 p-2'
                  onClick={() => navigate({ to: '/work-centers/add' })}
                >
                  <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                    <Plus className='size-4' />
                  </div>
                  <div className='text-muted-foreground font-medium'>Añadir Centro</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
