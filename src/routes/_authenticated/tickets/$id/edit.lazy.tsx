import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { TicketForm } from '@/features/tickets/components/ticket-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTicket, updateTicket } from '@/features/tickets/data/tickets-api'
import { toast } from 'sonner'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createLazyFileRoute('/_authenticated/tickets/$id/edit')({
  component: EditTicketPage,
})

function EditTicketPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicket(id),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      toast.success('Ticket actualizado correctamente')
      navigate({ to: '/tickets' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el ticket')
    },
  })

  if (isLoading) {
    return (
      <div className='flex h-[80vh] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className='flex h-[80vh] flex-col items-center justify-center gap-4'>
        <p className='text-muted-foreground'>Ticket no encontrado.</p>
        <Button onClick={() => navigate({ to: '/tickets' })}>Volver</Button>
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
      <Main>
        <TicketForm
          initialData={ticket}
          title='Editar Ticket'
          description='Modifica los detalles de tu solicitud antes de que sea procesada.'
          isSubmitting={isPending}
          onSubmit={(data) => mutate(data)}
          onCancel={() => navigate({ to: '/tickets' })}
        />
      </Main>
    </>
  )
}
