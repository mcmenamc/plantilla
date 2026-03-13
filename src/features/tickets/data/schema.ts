import { z } from 'zod'

export const ticketSchema = z.object({
  _id: z.string().optional(),
  user: z.any().optional(),
  module: z.string().min(1, 'El módulo es obligatorio'),
  type: z.enum(['Bug', 'Mejora', 'Cambio', 'Soporte']).default('Soporte'),
  priority: z.enum(['Baja', 'Media', 'Alta', 'Crítica']).default('Media'),
  comment: z.string().min(1, 'El comentario es obligatorio'),
  images: z.array(z.string()).default([]),
  status: z.enum(['Pendiente', 'En proceso', 'Finalizado', 'Rechazado']).default('Pendiente'),
  state: z.enum(['Activo', 'Eliminado']).default('Activo'),
  tracking: z.array(z.object({
    comment: z.string(),
    user: z.any(),
    images: z.array(z.string()).default([]),
    createdAt: z.string().or(z.date())
  })).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Ticket = z.infer<typeof ticketSchema>

export const createTicketSchema = z.object({
  module: z.string().min(1, 'El módulo es obligatorio'),
  type: z.enum(['Bug', 'Mejora', 'Cambio', 'Soporte']),
  priority: z.enum(['Baja', 'Media', 'Alta', 'Crítica']),
  comment: z.string().min(10, 'Describe el problema con al menos 10 caracteres'),
  images: z.array(z.string()),
  status: z.enum(['Pendiente', 'En proceso', 'Finalizado', 'Rechazado']),
})

export type CreateTicketPayload = z.infer<typeof createTicketSchema>
