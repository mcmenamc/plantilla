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

export const Route = createFileRoute('/_authenticated/invoicing/payment-complements/')({
  component: () => <Invoicing title='Complementos de Pago' description='Gestiona tus complementos de pago.' />,
  validateSearch: invoicesSearchSchema,
})
