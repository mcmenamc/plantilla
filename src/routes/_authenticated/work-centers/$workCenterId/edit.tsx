import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { WorkCentersForm } from '@/features/work-centers/components/work-centers-form'
import { WorkCentersProvider } from '@/features/work-centers/components/work-centers-provider'
import { WorkCentersActionDialog } from '@/features/work-centers/components/work-centers-action-dialog'
import { NotAuthorized } from '@/components/not-authorized'
import { usePermissions } from '@/hooks/use-permissions'

export const Route = createFileRoute(
    '/_authenticated/work-centers/$workCenterId/edit'
)({
    component: EditWorkCenter,
})

function EditWorkCenter() {
    const navigate = useNavigate()
    const { workCenterId } = Route.useParams()
    const { can, isLoading: isLoadingPermissions } = usePermissions()

    if (!isLoadingPermissions && !can('Editar')) return <NotAuthorized />

    return (
        <WorkCentersProvider>
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
                        onClick={() =>
                            navigate({ to: '/work-centers', search: { page: 1, perPage: 10 } })
                        }
                        title='Regresar'
                    >
                        <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>
                            Editar Centro de Trabajo
                        </h2>
                        <p className='text-muted-foreground'>
                            Modifica la información de tu centro de trabajo.
                        </p>
                    </div>
                </div>
                <div className='mx-auto max-w-5xl/8xl'>
                    <WorkCentersForm workCenterId={workCenterId} />
                </div>
            </Main>
            <WorkCentersActionDialog />
        </WorkCentersProvider>
    )
}
