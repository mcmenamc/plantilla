import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { accessToken, user } = useAuthStore.getState().auth
    if (!accessToken || !user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    if (!user.business && user.role ==='Admin') {
      throw redirect({
        to: '/configurar-cuenta',
      })
    }
  },
  component: AuthenticatedLayout,
})
