import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Bienvenido } from '@/features/bienvenido'
import { useAuthStore } from '@/stores/auth-store'

const bienvenidoSearchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/bienvenido')({
  beforeLoad: () => {
    const { accessToken } = useAuthStore.getState().auth
    if (accessToken) {
      throw redirect({ to: '/' })
    }
  },
  validateSearch: bienvenidoSearchSchema,
  component: Bienvenido,
})
