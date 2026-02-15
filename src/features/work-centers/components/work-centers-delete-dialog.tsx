import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type WorkCenter } from '../data/schema'
import { deleteWorkCenter } from '../data/work-centers-api'

type WorkCentersDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: WorkCenter
}

export function WorkCentersDeleteDialog({
    open,
    onOpenChange,
    currentRow,
}: WorkCentersDeleteDialogProps) {
    const [value, setValue] = useState('')
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: () => deleteWorkCenter(currentRow._id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-centers'] })
            toast.success('Centro de trabajo eliminado correctamente')
            onOpenChange(false)
            setValue('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar el centro de trabajo')
        },
    })

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={mutate}
            disabled={value.trim() !== currentRow.workcenterName || isPending}
            title={
                <span className='text-destructive'>
                    <AlertTriangle
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    Eliminar Centro de Trabajo
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        ¿Estás seguro de que quieres eliminar{' '}
                        <span className='font-bold text-foreground'>{currentRow.workcenterName}</span>?
                        <br />
                        Esta acción eliminará permanentemente el centro de trabajo con RFC{' '}
                        <span className='font-bold text-foreground'>{currentRow.rfc}</span> del sistema. Esta acción no se puede deshacer.
                    </p>

                    <Label className='my-2'>
                        Nombre del Centro de Trabajo:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Ingresa el nombre para confirmar la eliminación.'
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>¡Advertencia!</AlertTitle>
                        <AlertDescription>
                            Por favor ten cuidado, esta operación no puede ser revertida.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText='Eliminar'
            destructive
        />
    )
}
