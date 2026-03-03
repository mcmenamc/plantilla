import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type SeriesRow } from './series-columns'
import { deleteSeriesConfig } from '../data/series-api'

type SeriesDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: SeriesRow
}

export function SeriesDeleteDialog({
    open,
    onOpenChange,
    currentRow,
}: SeriesDeleteDialogProps) {
    const [value, setValue] = useState('')
    const queryClient = useQueryClient()
    const CONFIRM_TEXT = 'ELIMINAR CONFIGURACION'

    const { mutate: deleteMutate, isPending } = useMutation({
        mutationFn: () => deleteSeriesConfig(currentRow.workCenter),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['series'] })
            toast.success('Configuración de series eliminada con éxito')
            onOpenChange(false)
            setValue('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar la configuración')
        },
    })

    const handleDelete = () => {
        if (value.trim().toUpperCase() !== CONFIRM_TEXT) return
        deleteMutate()
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim().toUpperCase() !== CONFIRM_TEXT || isPending}
            isLoading={isPending}
            title={
                <span className='text-destructive text-xl font-bold'>
                    <AlertTriangle
                        className='stroke-destructive me-2 inline-block'
                        size={22}
                    />{' '}
                    Eliminar Configuración de Series
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2 text-muted-foreground'>
                        ¿Estás seguro de que deseas eliminar la configuración de series para este centro de trabajo?
                        <br />
                        <span className='font-bold text-foreground'>Esta acción es irreversible y afectará a todos los tipos de comprobantes.</span>
                    </p>

                    <Label className='space-y-2 block'>
                        <span className='text-sm font-medium'>Para confirmar, escribe <span className='font-bold text-primary'>{CONFIRM_TEXT}</span>:</span>
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className='h-11 rounded-xl'
                            placeholder={CONFIRM_TEXT}
                        />
                    </Label>

                    <Alert variant='destructive' className='border-destructive/20 bg-destructive/5 rounded-xl'>
                        <AlertTitle className='font-bold'>¡Atención!</AlertTitle>
                        <AlertDescription>
                            Al eliminar esta configuración, el sistema volverá a sus valores predeterminados y podrías perder la secuencia de tus folios.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText='Eliminar Configuración'
            destructive
        />
    )
}
