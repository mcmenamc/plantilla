import { Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'

export function WorkCentersPrimaryButtons() {
    const navigate = useNavigate()
    const { can } = usePermissions()

    // Si no tiene el permiso de 'Agregar' en la ruta actual o en '/work-centers', no renderizamos nada
    if (!can('Agregar')) return null

    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => navigate({ to: '/work-centers/add' })}>
                <span>Agregar Centro de Trabajo</span> <Plus size={18} />
            </Button>
        </div>
    )
}
