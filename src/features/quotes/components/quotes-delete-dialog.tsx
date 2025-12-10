'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Quote } from '../data/schema'

type QuotesDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: Quote
}

export function QuotesDeleteDialog({
    open,
    onOpenChange,
    currentRow,
}: QuotesDeleteDialogProps) {
    const [value, setValue] = useState('')

    const handleDelete = () => {
        if (value.trim() !== currentRow.folio) return

        onOpenChange(false)
        showSubmittedData(currentRow, 'La cotización ha sido eliminada:')
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
                    Eliminar Cotización
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        ¿Estás seguro de que quieres eliminar la cotización{' '}
                        <span className='font-bold'>{currentRow.folio}</span>?
                        <br />
                        Esta acción eliminará permanentemente la cotización del sistema.
                    </p>

                    <Label className='my-2'>
                        Folio de la cotización:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Escribe el folio para confirmar.'
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
