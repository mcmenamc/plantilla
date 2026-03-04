import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ConfigDrawer } from '@/components/config-drawer'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AdministratorsTable } from './components/administrators-table'
import { getAdministratorsByWorkCenter } from './data/administrators-api'
import { useWorkCenterStore } from '@/stores/work-center-store'

const route = getRouteApi('/_authenticated/users/')

export function Administrators() {
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const { selectedWorkCenterId } = useWorkCenterStore()


    const { data: administrators = [] } = useQuery({
        queryKey: ['administrators', selectedWorkCenterId],
        queryFn: () => getAdministratorsByWorkCenter(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

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

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Administradores</h2>
                        <p className='text-muted-foreground'>
                            Gestiona los accesos y permisos de los usuarios en este centro de trabajo.
                        </p>
                    </div>
                    <Button onClick={() => navigate({ to: '/users/add' })} className='space-x-1'>
                        <Plus size={18} />
                        <span>Nuevo Administrador</span>
                    </Button>
                </div>

                <AdministratorsTable
                    data={administrators}
                    search={search}
                    navigate={navigate}
                />
            </Main>
        </>
    )
}
