import { UserPlus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'

export function ClientsPrimaryButtons() {
    const navigate = useNavigate()
    const { can } = usePermissions()

    if (!can('Agregar')) return null

    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => navigate({ to: '/clients/add' })}>
                <span>Agregar Cliente</span> <UserPlus size={18} />
            </Button>
        </div>
    )
}
