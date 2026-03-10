import { Plus, RefreshCcw } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { dispararVerificacionDescargas, MassiveDownload } from '../data/massive-download-api'
import { usePermissions } from '@/hooks/use-permissions'

interface MassiveDownloadPrimaryButtonsProps {
    data: MassiveDownload[]
}

export function MassiveDownloadPrimaryButtons({ data }: MassiveDownloadPrimaryButtonsProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { can } = usePermissions()

    const hasPending = data.some(d => d.status === 'pending')

    const { mutate: refreshMutate, isPending: isRefreshing } = useMutation({
        mutationFn: dispararVerificacionDescargas,
        onSuccess: () => {
            toast.success('Sincronización con el SAT disparada')
            queryClient.invalidateQueries({ queryKey: ['massive-downloads'] })
        }
    })

    return (
        <div className='flex gap-2'>
            <Button
                variant='outline'
                onClick={() => refreshMutate()}
                disabled={isRefreshing || !hasPending}
                className='gap-2'
            >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className='hidden sm:inline'>Verificar Status</span>
                <span className='sm:hidden'>Verificar</span>
            </Button>
            {can('Agregar', 'Descarga Masiva') && (
                <Button
                    onClick={() => navigate({ to: '/massive-downloads/add' })}
                    className='gap-2'
                >
                    <Plus className='h-4 w-4' />
                    <span>Nueva Solicitud</span>
                </Button>
            )}
        </div>
    )
}
