import { useNavigate } from '@tanstack/react-router'
import { FileUp } from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useWorkCenters } from './work-centers-provider'

export function WorkCentersConfirmUploadDialog() {
    const { open, setOpen, currentRow, setCurrentRow } = useWorkCenters()
    const navigate = useNavigate()

    const handleConfirm = () => {
        setOpen('upload-cert')
    }

    const handleOpenChange = (state: boolean) => {
        if (!state) {
            setOpen(null)

            // If we are in the /add route, navigate back to list
            if (window.location.pathname.includes('/work-centers/add')) {
                navigate({ to: '/work-centers', search: { page: 1, perPage: 10 } })
                setTimeout(() => setCurrentRow(null), 500)
            }
        }
    }

    return (
        <ConfirmDialog
            open={open === 'confirm-upload'}
            onOpenChange={handleOpenChange}
            handleConfirm={handleConfirm}
            title={
                <span className='flex items-center gap-2'>
                    <FileUp className='h-5 w-5 text-primary' />
                    ¿Subir Certificados (CSD)?
                </span>
            }
            desc={
                <p>
                    El centro de trabajo <span className='font-bold text-foreground'>{currentRow?.workcenterName}</span> se ha creado correctamente.
                    <br /><br />
                    ¿Deseas subir los certificados (archivos .cer y .key) en este momento?
                </p>
            }
            confirmText='Sí, subir ahora'
            cancelBtnText='Más tarde'
        />
    )
}
