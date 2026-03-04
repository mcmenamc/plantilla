import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ClientsForm } from './clients-form'
import { type Client } from '../data/schema'

interface ClientCreateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (client: Client) => void
}

export function ClientCreateModal({ open, onOpenChange, onSuccess }: ClientCreateModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Nuevo Cliente</DialogTitle>
                    <DialogDescription>
                        Registra un nuevo cliente para utilizarlo en tus facturas.
                    </DialogDescription>
                </DialogHeader>
                <div className='py-4'>
                    <ClientsForm
                        onSuccess={(client) => {
                            onSuccess(client)
                            onOpenChange(false)
                        }}
                        onCancel={() => onOpenChange(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
