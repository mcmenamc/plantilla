import { createFileRoute } from '@tanstack/react-router'
import { SeriesEdit } from '@/features/series/components/series-edit'

export const Route = createFileRoute('/_authenticated/series/edit/$seriesId')({
    component: () => {
        const { seriesId } = Route.useParams()
        return <SeriesEdit seriesId={seriesId} />
    }
})
