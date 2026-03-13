import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { TicketForm } from '@/features/tickets/components/ticket-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTicket } from '@/features/tickets/data/tickets-api'
import { toast } from 'sonner'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export const Route = createLazyFileRoute('/_authenticated/tickets/add')({
  component: AddTicketPage,
})

function AddTicketPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('Ticket creado con éxito')
      navigate({ to: '/tickets' })
    },
    onError: () => {
      toast.error('Error al crear ticket')
    },
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
      <Main>
        <TicketForm
          title='Nuevo Ticket de Soporte'
          description='Reporta errores o sugiere mejoras para ayudarnos a mejorar tu experiencia.'
          isSubmitting={isPending}
          onSubmit={(data) => mutate(data)}
          onCancel={() => navigate({ to: '/tickets' })}
        />
      </Main>
    </>
  )
}
