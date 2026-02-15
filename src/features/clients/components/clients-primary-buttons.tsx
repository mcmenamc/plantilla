import { UserPlus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function ClientsPrimaryButtons() {
    const navigate = useNavigate()
    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => navigate({ to: '/clients/add' })}>
                <span>Agregar Cliente</span> <UserPlus size={18} />
            </Button>
        </div>
    )
}
