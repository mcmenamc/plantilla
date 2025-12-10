import { z } from 'zod'

export const clientSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    rfc: z.string(),
    status: z.string(),
    createdAt: z.date(),
})

export type Client = z.infer<typeof clientSchema>
