import { UserPlus, UploadCloud } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'
import { ImportClientsDialog } from './import-clients-dialog'
import { useState } from 'react'

export function ClientsPrimaryButtons() {
    const navigate = useNavigate()
    const { can } = usePermissions()
    const [importOpen, setImportOpen] = useState(false)

    if (!can('Agregar')) return null

    return (
        <div className='flex gap-2 items-center'>
            <Button variant="outline" className='space-x-1' onClick={() => setImportOpen(true)}>
                <span>Importar CSV/Excel</span> <UploadCloud size={18} />
            </Button>
            <Button className='space-x-1' onClick={() => navigate({ to: '/clients/add' })}>
                <span>Agregar Cliente</span> <UserPlus size={18} />
            </Button>
            
            <ImportClientsDialog open={importOpen} onOpenChange={setImportOpen} />
        </div>
    )
}
