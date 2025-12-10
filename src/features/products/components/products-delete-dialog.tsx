'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Product } from '../data/schema'

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

    const handleDelete = () => {
        if (value.trim() !== currentRow.name) return

        onOpenChange(false)
        showSubmittedData(currentRow, 'El producto ha sido eliminado:')
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim() !== currentRow.name}
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
                        <span className='font-bold'>{currentRow.name}</span>?
                        <br />
                        Esta acción eliminará permanentemente el producto del sistema.
                    </p>

                    <Label className='my-2'>
                        Nombre del producto:
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
            destructive
        />
    )
}
