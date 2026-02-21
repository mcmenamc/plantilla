'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Product } from '../data/schema'
import { eliminarProducto } from '../data/products-api'
import { useWorkCenterStore } from '@/stores/work-center-store'

type ProductsDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: Product
}

export function ProductsDeleteDialog({
    open,
    onOpenChange,
    currentRow,
}: ProductsDeleteDialogProps) {
    const [value, setValue] = useState('')
    const queryClient = useQueryClient()
    const { selectedWorkCenterId } = useWorkCenterStore()

    const { mutate: deleteMutate, isPending } = useMutation({
        mutationFn: () => eliminarProducto(currentRow._id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', selectedWorkCenterId] })
            toast.success('Producto eliminado con éxito')
            onOpenChange(false)
            setValue('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar el producto')
        },
    })

    const handleDelete = () => {
        if (value.trim() !== currentRow.description) return
        deleteMutate()
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim() !== currentRow.description || isPending}
            isLoading={isPending}
            title={
                <span className='text-destructive'>
                    <AlertTriangle
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    Eliminar Producto
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        ¿Estás seguro de que quieres eliminar{' '}
                        <span className='font-bold'>{currentRow.description}</span>?
                        <br />
                        Esta acción eliminará permanentemente el producto del sistema.
                    </p>

                    <Label className='my-2'>
                        Descripción del producto:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Escribe la descripción para confirmar.'
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
            destructive
        />
    )
}
