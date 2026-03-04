import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ProductsForm } from './products-form'
import { type Product } from '../data/schema'

interface ProductCreateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (product: Product) => void
}

export function ProductCreateModal({ open, onOpenChange, onSuccess }: ProductCreateModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[1000px] max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Nuevo Producto</DialogTitle>
                    <DialogDescription>
                        Registra un nuevo producto para utilizarlo en tus facturas.
                    </DialogDescription>
                </DialogHeader>
                <div className='py-4'>
                    <ProductsForm
                        onSuccess={(product) => {
                            onSuccess(product)
                            onOpenChange(false)
                        }}
                        onCancel={() => onOpenChange(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
