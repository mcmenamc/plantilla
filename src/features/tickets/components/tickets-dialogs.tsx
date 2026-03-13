import { useTickets } from './tickets-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTicket } from '../data/tickets-api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'

export function TicketsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTickets()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setOpen(null)
      setCurrentRow(null)
      toast.success('Ticket eliminado')
    },
    onError: () => {
      toast.error('Error al eliminar el ticket')
    },
  })

  const closeAndReset = () => {
    setOpen(null)
    setCurrentRow(null)
  }

  return (
    <>
      {/* Confirmar eliminación */}
      <AlertDialog
        open={open === 'delete'}
        onOpenChange={(v) => { if (!v) closeAndReset() }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Trash2 size={18} className='text-red-500' />
              Eliminar ticket
            </AlertDialogTitle>
            <AlertDialogDescription>
              El ticket <span className='font-semibold'>#{currentRow?._id?.slice(-6).toUpperCase()}</span> será
              marcado como eliminado y ya no aparecerá en la lista.
              <br />
              <span className='text-xs text-muted-foreground mt-1 block'>
                Esta acción se puede revertir contactando a soporte.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeAndReset}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-600 hover:bg-red-700 gap-2'
              onClick={() => currentRow?._id && deleteMutation.mutate(currentRow._id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? <Loader2 size={14} className='animate-spin' />
                : <Trash2 size={14} />
              }
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
