import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, UserPen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { type Administrator } from '../data/schema'
import { deleteAdministrator } from '../data/administrators-api'
import { usePermissions } from '@/hooks/use-permissions'

type DataTableRowActionsProps = {
    row: Row<Administrator>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
    const { can } = usePermissions()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const deleteMutation = useMutation({
        mutationFn: deleteAdministrator,
        onSuccess: (data) => {
            toast.success(data.message)
            queryClient.invalidateQueries({ queryKey: ['administrators'] })
            setShowDeleteDialog(false)
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar acceso')
        },
    })

    const admin = row.original

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                    >
                        <DotsHorizontalIcon className='h-4 w-4' />
                        <span className='sr-only'>Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-[160px]'>
                    {can('Editar') && (
                        <DropdownMenuItem onClick={() => navigate({ to: `/users/${admin._id}` })}>
                            Editar
                            <DropdownMenuShortcut>
                                <UserPen size={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    )}
                    {can('Eliminar') && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className='text-red-500!'
                            >
                                Eliminar
                                <DropdownMenuShortcut>
                                    <Trash2 size={16} />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el acceso de {admin.user.nombre} a este centro de trabajo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className='bg-red-600 hover:bg-red-700'
                            onClick={(e) => {
                                e.preventDefault()
                                deleteMutation.mutate(admin._id)
                            }}
                        >
                            Confirmar Eliminación
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
