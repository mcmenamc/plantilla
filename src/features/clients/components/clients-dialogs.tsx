import { ClientsDeleteDialog } from './clients-delete-dialog'
import { useClients } from './clients-provider'

export function ClientsDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useClients()
    return (
        <>
            {currentRow && (
                <ClientsDeleteDialog
                    key={`client-delete-${currentRow._id}`}
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
