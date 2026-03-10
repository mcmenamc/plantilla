import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '@/features/auth/reset-password'

export const Route = createFileRoute('/(auth)/reset-password')({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            token: search.token || undefined,
        }
    },
    component: ResetPassword,
})
