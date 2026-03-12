import { FilePlus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'

export function InvoicesPrimaryButtons() {
    const navigate = useNavigate()
    const { can } = usePermissions()

    if (!can('Agregar')) return null

    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => navigate({ to: '/invoicing/new' } as any)}>
                <span>Nueva Factura</span> <FilePlus size={18} />
            </Button>
        </div>
    )
}
