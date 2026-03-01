import { createFileRoute } from '@tanstack/react-router'
import { Viewer } from '@/features/viewer'
import { z } from 'zod'

const searchSchema = z.object({
  path: z.string().min(1),
  title: z.string().optional(),
  type: z.enum(['pdf', 'xml', 'image']).optional()
})

export const Route = createFileRoute('/_authenticated/viewer/')({
  component: Viewer,
  validateSearch: (search) => searchSchema.parse(search),
})
