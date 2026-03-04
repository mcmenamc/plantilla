import { z } from 'zod'

export const moduleSchema = z.object({
    _id: z.string(),
    nombre: z.string(),
    acciones: z.array(z.string()),
    estatus: z.string(),
    icono: z.string().optional(),
    orden: z.union([z.string(), z.number()]).optional(),
    padre: z.string().nullable().optional(),
})

export type Module = z.infer<typeof moduleSchema>

export const administratorPermissionSchema = z.object({
    module: z.union([z.string(), moduleSchema]),
    actions: z.array(z.string()),
})

export type AdministratorPermission = z.infer<typeof administratorPermissionSchema>

export const administratorSchema = z.object({
    _id: z.string(),
    user: z.object({
        _id: z.string(),
        nombre: z.string(),
        apellidos: z.string(),
        email: z.string(),
    }),
    workCenter: z.string(),
    permissions: z.array(administratorPermissionSchema),
    status: z.enum(['Activo', 'Inactivo']),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
})

export type Administrator = z.infer<typeof administratorSchema>

export const administratorFormSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellidos: z.string().min(1, 'Los apellidos son requeridos'),
    email: z.string().email('Email inválido'),
    workCenterId: z.string().optional(),
    permissions: z.array(z.object({
        module: z.string(),
        actions: z.array(z.string()),
    })),
})

export type AdministratorFormValues = z.infer<typeof administratorFormSchema>
