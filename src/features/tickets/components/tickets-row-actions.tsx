import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ticket } from '../data/schema'
import { useTickets } from './tickets-provider'
import { useAuthStore } from '@/stores/auth-store'
import { useNavigate } from '@tanstack/react-router'

interface TicketsRowActionsProps<TData> {
  row: Row<TData>
}

export function TicketsRowActions<TData>({ row }: TicketsRowActionsProps<TData>) {
  const { setOpen, setCurrentRow } = useTickets()
  const { auth: { user } } = useAuthStore()
  const navigate = useNavigate()
  
  const ticket = row.original as Ticket
  const isRoot = user?.role === 'Root'
  const isOwner = String((ticket.user as any)?._id || ticket.user) === String(user?.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[170px]'>
        <DropdownMenuItem
          onClick={() => navigate({ to: `/tickets/${ticket._id}/seguimiento` })}
        >
          <Eye className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
          Ver detalle
        </DropdownMenuItem>

        {isOwner && (
          <DropdownMenuItem
            onClick={() => navigate({ to: `/tickets/${ticket._id}/edit` })}
          >
            <Edit2 className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
            Editar ticket
          </DropdownMenuItem>
        )}

        {(isRoot || isOwner) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-red-600 focus:text-red-600'
              onClick={() => {
                setCurrentRow(ticket)
                setOpen('delete')
              }}
            >
              <Trash2 className='mr-2 h-3.5 w-3.5' />
              Eliminar ticket
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
