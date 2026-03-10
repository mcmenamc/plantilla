import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { MassiveDownloadForm } from '@/features/massive-download/components/massive-download-form'
import { usePermissions } from '@/hooks/use-permissions'
import { NotAuthorized } from '@/components/not-authorized'

export const Route = createFileRoute('/_authenticated/massive-downloads/add')({
    component: AddMassiveDownload,
})

function AddMassiveDownload() {
    const navigate = useNavigate()
    const { can, isLoading: isLoadingPermissions } = usePermissions()

    if (!isLoadingPermissions && !can('Agregar', 'Descarga Masiva')) return <NotAuthorized />

    return (
        <>
            <Header fixed>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-6 flex items-center gap-4'>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => navigate({ to: '/massive-downloads' })}
                        title='Regresar'
                    >
                        <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Nueva Solicitud SAT</h2>
                        <p className='text-muted-foreground'>
                            Inicia un nuevo proceso de descarga masiva desde los servidores del SAT.
                        </p>
                    </div>
                </div>
                <div className='mx-auto max-w-8xl'>
                    <MassiveDownloadForm />
                </div>
            </Main>
        </>
    )
}
