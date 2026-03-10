import { WorkCentersDeleteDialog } from './work-centers-delete-dialog'
import { WorkCentersLogoDialog } from './work-centers-logo-dialog'
import { WorkCentersUploadCertDialog } from './work-centers-upload-cert-dialog'
import { WorkCentersConfirmUploadDialog } from './work-centers-confirm-upload-dialog'
import { WorkCentersUploadOpinionDialog } from './work-centers-upload-opinion-dialog'
import { WorkCentersUploadFielDialog } from './work-centers-upload-fiel-dialog'
import { WorkCentersConfigDialog } from './work-centers-config-dialog'
import { useWorkCenters } from './work-centers-provider'

export function WorkCentersActionDialog() {
    const { open, setOpen, currentRow, setCurrentRow } = useWorkCenters()

    return (
        <>
            {currentRow && (
                <>
                    <WorkCentersDeleteDialog
                        key={`delete-${currentRow._id}`}
                        open={open === 'delete'}
                        onOpenChange={(isOpen) => {
                            if (!isOpen) {
                                setOpen(null)
                                setTimeout(() => setCurrentRow(null), 500)
                            }
                        }}
                        currentRow={currentRow}
                    />
                    <WorkCentersLogoDialog />
                    <WorkCentersUploadCertDialog />
                    <WorkCentersConfirmUploadDialog />
                    <WorkCentersUploadOpinionDialog />
                    <WorkCentersUploadFielDialog />
                    <WorkCentersConfigDialog />
                </>
            )}
        </>
    )
}
