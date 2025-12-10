'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Invoice } from '../data/schema'

type InvoicesDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: Invoice
}

export function InvoicesDeleteDialog({
    open,
    onOpenChange,
    currentRow,
}: InvoicesDeleteDialogProps) {
    const [value, setValue] = useState('')

    const handleDelete = () => {
        if (value.trim() !== currentRow.folio) return

        onOpenChange(false)
        showSubmittedData(currentRow, 'La factura ha sido cancelada:')
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim() !== currentRow.folio}
            title={
                <span className='text-destructive'>
                    <AlertTriangle
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    Cancelar Factura
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        ¿Estás seguro de que quieres cancelar la factura{' '}
                        <span className='font-bold'>{currentRow.folio}</span>?
                        <br />
                        Esta acción cancelará la factura en el sistema.
                    </p>

                    <Label className='my-2'>
                        Folio de la factura:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Escribe el folio para confirmar.'
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>¡Advertencia!</AlertTitle>
                        <AlertDescription>
                            Ten cuidado, esta operación puede tener implicaciones fiscales.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText='Cancelar'
            destructive
        />
    )
}
