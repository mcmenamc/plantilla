import { useNavigate } from '@tanstack/react-router'
import { Plus, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'
import { ImportProductsDialog } from './import-products-dialog'
import { useState } from 'react'

export function ProductsPrimaryButtons() {
    const { can } = usePermissions()
    const navigate = useNavigate()
    const [importOpen, setImportOpen] = useState(false)

    if (!can('Agregar')) return null

    return (
        <div className='flex gap-2 items-center'>
            <Button variant="outline" className='space-x-1' onClick={() => setImportOpen(true)}>
                <span>Importar CSV/Excel</span> <UploadCloud size={18} />
            </Button>
            <Button className='space-x-1' onClick={() => navigate({ to: '/products/add' })}>
                <span>Agregar Producto</span> <Plus size={18} />
            </Button>
            
            <ImportProductsDialog open={importOpen} onOpenChange={setImportOpen} />
        </div>
    )
}
