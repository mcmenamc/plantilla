import { ProductsDeleteDialog } from './products-delete-dialog'
import { useProducts } from './products-provider'

export function ProductsDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useProducts()
    return (
        <>
            {currentRow && (
                <ProductsDeleteDialog
                    key={`product-delete-${currentRow._id}`}
                    open={open === 'delete'}
                    onOpenChange={() => {
                        setOpen('delete')
                        setTimeout(() => {
                            setCurrentRow(null)
                        }, 500)
                    }}
                    currentRow={currentRow}
                />
            )}
        </>
    )
}
