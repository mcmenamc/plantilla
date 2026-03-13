import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getTickets } from './data/tickets-api'
import { TicketsTable } from './components/tickets-table'
import { TicketsProvider } from './components/tickets-provider'
import { TicketsDialogs } from './components/tickets-dialogs'

import { useNavigate } from '@tanstack/react-router'

function TicketsPrimaryButtons() {
  const navigate = useNavigate()
  return (
    <Button onClick={() => navigate({ to: '/tickets/add' })} className='gap-2 shadow-lg shadow-primary/20 h-11'>
      <Plus size={18} />
      Nuevo Ticket
    </Button>
  )
}

function TicketsContent() {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  })

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
              Tickets de Soporte
            </h2>
            <p className='text-muted-foreground'>
              Reporta errores y solicita mejoras en la plataforma.
            </p>
          </div>
          <TicketsPrimaryButtons />
        </div>

        <TicketsTable data={tickets} isLoading={isLoading} />
      </Main>

      <TicketsDialogs />
    </>
  )
}

export default function Tickets() {
  return (
    <TicketsProvider>
      <TicketsContent />
    </TicketsProvider>
  )
}
