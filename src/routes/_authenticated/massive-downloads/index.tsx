import { createFileRoute } from '@tanstack/react-router'
import MassiveDownloadPage from '@/features/massive-download'

export const Route = createFileRoute('/_authenticated/massive-downloads/')({
    component: MassiveDownloadPage,
})
