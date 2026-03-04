import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { InvoiceFormIngreso } from './invoice-form-ingreso'
import { type Invoice } from '../data/schema'

type InvoicesActionDialogProps = {
    currentRow?: Invoice
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InvoicesActionDialog({
    currentRow,
    open,
    onOpenChange,
}: InvoicesActionDialogProps) {
    const isEdit = !!currentRow

    // If it's not edit, we don't use this dialog anymore for creation
    if (!open) return null
    if (!isEdit) return null

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader className='text-start'>
                    <DialogTitle>Editar Factura</DialogTitle>
                    <DialogDescription>
                        Actualiza los datos de la factura.
                    </DialogDescription>
                </DialogHeader>

                <InvoiceFormIngreso
                    onSubmitSuccess={() => {
                        onOpenChange(false)
                    }}
                    onCancel={() => {
                        onOpenChange(false)
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}
