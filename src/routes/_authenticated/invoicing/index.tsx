import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Invoicing } from '@/features/invoicing'

const invoicesSearchSchema = z.object({
  sort: z.string().optional(),
  client: z.string().optional(),
  q: z.string().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  tipo: z.union([z.string(), z.array(z.string())]).optional(),
  metodo: z.union([z.string(), z.array(z.string())]).optional(),
})

export const Route = createFileRoute('/_authenticated/invoicing/')({
  component: Invoicing,
  validateSearch: invoicesSearchSchema,
})
