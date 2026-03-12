'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Invoice } from '../data/schema'
import { cancelInvoice } from '../data/invoicing-api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    const [motive, setMotive] = useState('02')
    const [substitution, setSubstitution] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)
    const queryClient = useQueryClient()
    const { selectedWorkCenterId } = useWorkCenterStore()

    const handleDelete = async () => {
        if (motive === '01' && !substitution.trim()) {
            toast.error('Factura a sustituir requerida para el motivo 01')
            return
        }

        setIsCancelling(true)
        toast.loading('Cancelando CFDI...')
        try {
            await cancelInvoice({
                facturaId: currentRow._id,
                motive,
                substitution: motive === '01' ? substitution : undefined
            })
            toast.dismiss()
            toast.success('Factura cancelada exitosamente')
            queryClient.invalidateQueries({ queryKey: ['invoices', selectedWorkCenterId] })
            onOpenChange(false)
        } catch (e: any) {
            toast.dismiss()
            toast.error(e.response?.data?.message || 'Error al cancelar factura')
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={isCancelling || (motive === '01' && !substitution.trim())}
            title={
                <span className='text-destructive'>
                    <AlertTriangle
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    {currentRow.status === 'draft' ? 'Eliminar Borrador' : 'Cancelar Factura'}
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        ¿Estás seguro de que quieres cancelar la factura{' '}
                        <span className='font-bold'>{currentRow.folio_number}</span>?
                        <br />
                        {currentRow.status === 'draft' ? 'El borrador será eliminado definitivamente.' : 'Esta acción mandará una solicitud de cancelación al SAT.'}
                    </p>

                    {currentRow.status !== 'draft' && (
                        <div className='flex flex-col gap-4 mb-4'>
                            <Label className='space-y-2 text-left block w-full'>
                                Motivo de Cancelación:
                                <Select value={motive} onValueChange={setMotive}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un motivo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="01">01 - Comprobante emitido con errores con relación</SelectItem>
                                        <SelectItem value="02">02 - Comprobante emitido con errores sin relación</SelectItem>
                                        <SelectItem value="03">03 - No se llevó a cabo la operación</SelectItem>
                                        <SelectItem value="04">04 - Operación nominativa relacionada en la factura global</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Label>

                            {motive === '01' && (
                                <Label className='space-y-2'>
                                    Folio Fiscal (UUID) de la factura que sustituye:
                                    <Input
                                        value={substitution}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubstitution(e.target.value)}
                                        placeholder='Escribe el UUID o el id interno de facturapi...'
                                        className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                                    />
                                </Label>
                            )}
                        </div>
                    )}

                    <Alert variant='destructive'>
                        <AlertTitle>¡Advertencia!</AlertTitle>
                        <AlertDescription>
                            Ten cuidado, esta operación puede tener implicaciones fiscales.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText='Cancelar CFDI'
            destructive
        />
    )
}
