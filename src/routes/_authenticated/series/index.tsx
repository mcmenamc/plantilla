import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Series } from '@/features/series'

const seriesSearchSchema = z.object({
    page: z.number().catch(1),
    perPage: z.number().catch(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    status: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/series/')({
    component: Series,
    validateSearch: seriesSearchSchema,
})
