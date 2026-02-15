import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { WorkCenters } from '@/features/work-centers'

const workCentersSearchSchema = z.object({
    page: z.number().catch(1),
    perPage: z.number().catch(10),
    sort: z.string().optional(),
    workcenterName: z.string().optional(),
    status: z.array(z.string()).optional(),
    tipo: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_authenticated/work-centers/')({
    component: WorkCenters,
    validateSearch: workCentersSearchSchema,
})
