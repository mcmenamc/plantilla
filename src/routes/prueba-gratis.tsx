import { createFileRoute, redirect } from '@tanstack/react-router'
import { PruebaGratis } from '@/features/prueba-gratis'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/prueba-gratis')({
  beforeLoad: () => {
    const { accessToken } = useAuthStore.getState().auth
    if (accessToken) {
      throw redirect({ to: '/' })
    }
  },
  component: PruebaGratis,
})
