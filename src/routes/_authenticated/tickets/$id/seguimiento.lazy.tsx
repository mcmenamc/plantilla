import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { TicketDetails } from '@/features/tickets/components/ticket-details'
import { useQuery } from '@tanstack/react-query'
import { getTicket } from '@/features/tickets/data/tickets-api'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Loader2 } from 'lucide-react'

export const Route = createLazyFileRoute('/_authenticated/tickets/$id/seguimiento')({
  component: SeguimientoPage,
})

function SeguimientoPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicket(id),
    refetchInterval: 10000, // Refrescar cada 10s para ver nuevos mensajes
  })

  if (isLoading) {
    return (
      <div className='flex h-[80vh] items-center justify-center'>
        <div className='flex flex-col items-center gap-4 text-muted-foreground'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
          <p className='text-sm font-medium animate-pulse'>Cargando historial del ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className='flex h-[80vh] flex-col items-center justify-center gap-4'>
        <div className='p-6 rounded-full bg-muted'>
           <Loader2 className='h-8 w-8 text-muted-foreground opacity-50' />
        </div>
        <div className='text-center'>
            <h3 className='text-lg font-bold'>Ticket no encontrado</h3>
            <p className='text-sm text-muted-foreground mt-1'>No hemos podido localizar la información solicitada.</p>
        </div>
       
      </div>
    )
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='pb-20'>
        <TicketDetails
          ticket={ticket}
          mode='tracking'
          onBack={() => navigate({ to: '/tickets' })}
        />
      </Main>
    </>
  )
}
