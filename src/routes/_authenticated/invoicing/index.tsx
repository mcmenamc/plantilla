import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Invoicing } from '@/features/invoicing'

const invoicesSearchSchema = z.object({
  page: z.number().catch(1),
  perPage: z.number().catch(10),
  sort: z.string().optional(),
  client: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/invoicing/')({
  component: Invoicing,
  validateSearch: invoicesSearchSchema,
})
