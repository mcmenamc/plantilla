import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'

export function ProductsPrimaryButtons() {
    const { can } = usePermissions()
    const navigate = useNavigate()

    if (!can('Agregar')) return null

    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => navigate({ to: '/products/add' })}>
                <span>Agregar Producto</span> <Plus size={18} />
            </Button>
        </div>
    )
}
