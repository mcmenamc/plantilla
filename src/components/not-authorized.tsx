import { useNavigate } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LoadingBar from 'react-top-loading-bar'

export function NotAuthorized({ is_loading }: { is_loading?: boolean }) {
    const navigate = useNavigate()

    if (is_loading) return <LoadingBar />

    return (
        <div className='flex h-[80vh] w-full flex-col items-center justify-center gap-6 px-4 text-center'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
                <ShieldAlert className='h-10 w-10 text-red-600 dark:text-red-500' />
            </div>

            <div className='flex flex-col gap-2'>
                <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                    Acceso Denegado
                </h1>
                <p className='text-muted-foreground max-w-[500px]'>
                    No tienes los permisos necesarios para realizar esta acción o visualizar esta página.
                    Contacta al administrador para solicitar acceso.
                </p>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row'>
                <Button
                    onClick={() => navigate({ to: '/' })}
                    size='lg'
                >
                    Volver al Inicio
                </Button>
                <Button
                    variant='outline'
                    size='lg'
                    onClick={() => window.history.back()}
                >
                    Regresar a página anterior
                </Button>
            </div>
        </div>
    )
}
