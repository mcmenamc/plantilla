import { InvoicesDeleteDialog } from './invoices-delete-dialog'
import { useInvoices } from './invoices-provider'

export function InvoicesDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useInvoices()
    return (
        <>
            {currentRow && (
                <InvoicesDeleteDialog
                    key={`invoice-delete-${currentRow._id}`}
                    open={open === 'delete'}
                    onOpenChange={(v) => {
                        if (!v) {
                            setOpen(null)
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        } else {
                            setOpen('delete')
                        }
                    }}
                    currentRow={currentRow}
                />
            )}
        </>
    )
}
