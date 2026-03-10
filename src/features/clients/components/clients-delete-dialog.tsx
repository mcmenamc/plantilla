'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteClient } from '../data/clients-api'
import { type Client } from '../data/schema'

type ClientsDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: Client
}

export function ClientsDeleteDialog({
    open,
    onOpenChange,
    currentRow,
}: ClientsDeleteDialogProps) {
    const [value, setValue] = useState('')
    const queryClient = useQueryClient()

    const { mutate: deleteMutate, isPending } = useMutation({
        mutationFn: () => deleteClient(currentRow._id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            toast.success('Cliente eliminado correctamente')
            onOpenChange(false)
            setValue('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar el cliente')
        },
    })

    const handleDelete = () => {
        if (value.trim() !== currentRow.razonSocial) return
        deleteMutate()
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim() !== currentRow.razonSocial}
            title={
                <span className='text-destructive'>
                    <AlertTriangle
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    Eliminar Cliente
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        ¿Estás seguro de que quieres eliminar a{' '}
                        <span className='font-bold'>{currentRow.razonSocial}</span>?
                        <br />
                        Esta acción eliminará permanentemente al cliente del sistema.
                    </p>

                    <Label className='my-2'>
                        Nombre del cliente:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Escribe el nombre para confirmar.'
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>¡Advertencia!</AlertTitle>
                        <AlertDescription>
                            Ten cuidado, esta operación no se puede deshacer.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText='Eliminar'
            isLoading={isPending}
            destructive
        />
    )
}
