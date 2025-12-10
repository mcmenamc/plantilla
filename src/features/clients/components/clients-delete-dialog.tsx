'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
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

    const handleDelete = () => {
        if (value.trim() !== currentRow.name) return

        onOpenChange(false)
        showSubmittedData(currentRow, 'El cliente ha sido eliminado:')
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
                    Eliminar Cliente
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        ¿Estás seguro de que quieres eliminar a{' '}
                        <span className='font-bold'>{currentRow.name}</span>?
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
            destructive
        />
    )
}
