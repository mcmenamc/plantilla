import { createFileRoute } from '@tanstack/react-router'
import { SeriesCreate } from '@/features/series/components/series-create'

export const Route = createFileRoute('/_authenticated/series/create')({
    component: SeriesCreate,
})
