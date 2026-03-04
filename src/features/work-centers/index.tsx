import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { WorkCentersPrimaryButtons } from './components/work-centers-primary-buttons'
import { WorkCentersProvider } from './components/work-centers-provider'
import { WorkCentersTable } from './components/work-centers-table'
import { getWorkCenters } from './data/work-centers-api'
import { usePermissions } from '@/hooks/use-permissions'
import { NotAuthorized } from '@/components/not-authorized'

const route = getRouteApi('/_authenticated/work-centers/')

export function WorkCenters() {
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const { can, isLoading: isLoadingPermissions } = usePermissions()

    const { data: workCenters = [], isLoading } = useQuery({
        queryKey: ['work-centers'],
        queryFn: getWorkCenters,
    })

    if (!isLoadingPermissions && !can('Ver')) return <NotAuthorized />

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

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Centros de Trabajo</h2>
                        <p className='text-muted-foreground'>
                            Gestiona los centros de trabajo de tu empresa.
                        </p>
                    </div>
                    <WorkCentersPrimaryButtons />
                </div>
                {isLoading ? (
                    <div className='flex flex-1 items-center justify-center h-64'>
                        <p>Cargando centros de trabajo...</p>
                    </div>
                ) : (
                    <WorkCentersTable data={workCenters} search={search} navigate={navigate as any} />
                )}
            </Main>
        </WorkCentersProvider>
    )
}
