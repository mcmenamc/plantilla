import { useSearch } from '@tanstack/react-router'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

export function ResetPassword() {
    const { token } = useSearch({ from: '/(auth)/reset-password' })

    if (!token) {
        return (
            <AuthLayout>
                <Card className='gap-4'>
                    <CardHeader>
                        <CardTitle className='text-lg tracking-tight'>
                            Token faltante
                        </CardTitle>
                        <CardDescription>
                            El enlace es inválido o ha expirado. Por favor solicita uno nuevo.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <Card className='gap-4'>
                <CardHeader>
                    <CardTitle className='text-lg tracking-tight'>
                        Restablecer Contraseña
                    </CardTitle>
                    <CardDescription>
                        Ingresa tu nueva contraseña a continuación.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResetPasswordForm token={token as string} />
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
