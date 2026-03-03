import { SeriesDeleteDialog } from './series-delete-dialog'
import { useSeries } from './series-provider'

export function SeriesDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useSeries()
    return (
        <>
            {currentRow && (
                <SeriesDeleteDialog
                    key={`series-delete-${currentRow.workCenter}`}
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
