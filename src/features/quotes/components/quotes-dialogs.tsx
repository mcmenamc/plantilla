import { QuotesActionDialog } from './quotes-action-dialog'
import { QuotesDeleteDialog } from './quotes-delete-dialog'
import { useQuotes } from './quotes-provider'

export function QuotesDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useQuotes()
    return (
        <>
            <QuotesActionDialog
                key='quote-add'
                open={open === 'add'}
                onOpenChange={() => setOpen('add')}
            />

            {currentRow && (
                <>
                    <QuotesActionDialog
                        key={`quote-edit-${currentRow.id}`}
                        open={open === 'edit'}
                        onOpenChange={() => {
                            setOpen('edit')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />

                    <QuotesDeleteDialog
                        key={`quote-delete-${currentRow.id}`}
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
