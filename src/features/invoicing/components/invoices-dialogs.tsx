import { InvoicesActionDialog } from './invoices-action-dialog'
import { InvoicesDeleteDialog } from './invoices-delete-dialog'
import { useInvoices } from './invoices-provider'

export function InvoicesDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useInvoices()
    return (
        <>
            <InvoicesActionDialog
                key='invoice-add'
                open={open === 'add'}
                onOpenChange={() => setOpen('add')}
            />

            {currentRow && (
                <>
                    <InvoicesActionDialog
                        key={`invoice-edit-${currentRow.id}`}
                        open={open === 'edit'}
                        onOpenChange={() => {
                            setOpen('edit')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />

                    <InvoicesDeleteDialog
                        key={`invoice-delete-${currentRow.id}`}
                        open={open === 'delete'}
                        onOpenChange={() => {
                            setOpen('delete')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />
                </>
            )}
        </>
    )
}
