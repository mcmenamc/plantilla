import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { getDescargasByWorkCenter } from './data/massive-download-api'
import { MassiveDownloadPrimaryButtons } from './components/massive-download-primary-buttons'
import { MassiveDownloadTableView } from './components/massive-download-table-view'
import { usePermissions } from '@/hooks/use-permissions'
import { NotAuthorized } from '@/components/not-authorized'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/_authenticated/massive-downloads/')

export default function MassiveDownloadPage() {
    const { can, isLoading: isLoadingPermissions } = usePermissions()
    const { selectedWorkCenterId } = useWorkCenterStore()
    const navigate = route.useNavigate()
    const search = route.useSearch()

    const { data: downloads = [], isLoading } = useQuery({
        queryKey: ['massive-downloads', selectedWorkCenterId],
        queryFn: () => getDescargasByWorkCenter(selectedWorkCenterId!),
        enabled: !!selectedWorkCenterId,
    })

    if (!isLoadingPermissions && !can('Ver', 'Descarga Masiva')) return <NotAuthorized />

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
                {!selectedWorkCenterId ? (
                    <div className='flex h-[400px] items-center justify-center'>
                        <p className='text-muted-foreground'>Selecciona un centro de trabajo para ver las descargas.</p>
                    </div>
                ) : (
                    <>
                        <div className='flex flex-wrap items-end justify-between gap-2'>
                            <div>
                                <h2 className='text-2xl font-bold tracking-tight'>Descarga Masiva SAT</h2>
                                <p className='text-muted-foreground'>
                                    Gestiona tus solicitudes de descarga masiva de XMLs directamente desde el SAT.
                                </p>
                            </div>
                            <MassiveDownloadPrimaryButtons data={downloads} />
                        </div>

                        <MassiveDownloadTableView
                            data={downloads}
                            search={search}
                            navigate={navigate as any}
                            isLoading={isLoading}
                        />
                    </>
                )}
            </Main>
        </>
    )
}
