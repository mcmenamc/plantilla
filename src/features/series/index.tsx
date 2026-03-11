import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { SeriesDialogs } from './components/series-dialogs'
import { SeriesPrimaryButtons } from './components/series-primary-buttons'
import { SeriesProvider } from './components/series-provider'
import { SeriesTable } from './components/series-table'
import { getSeriesConfig } from './data/series-api'
import { NotAuthorized } from '@/components/not-authorized'
import { usePermissions } from '@/hooks/use-permissions'

const route = getRouteApi('/_authenticated/series/')

export function Series() {
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const { selectedWorkCenterId } = useWorkCenterStore()

    const { data: seriesResp, isLoading } = useQuery({
        queryKey: ['series', selectedWorkCenterId],
        queryFn: () => getSeriesConfig(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

    // Transform data: One row per type if isPerType is true
    const flattenedData = seriesResp?.data ? (
        seriesResp.data.isPerType ?
            Object.entries(seriesResp.data.typeConfigs).map(([type, config]: [string, any]) => ({
                ...seriesResp.data,
                typeCode: type,
                typeName: type === 'I' ? 'Ingreso' :
                    type === 'E' ? 'Egreso' :
                        type === 'P' ? 'Pago' :
                            type === 'N' ? 'Nómina' : 'Traslado',
                prefix: config.prefix,
                next_folio: config.next_folio,
                // Keep original for actions
                originalConfig: seriesResp.data
            })) :
            [{
                ...seriesResp.data,
                typeCode: 'GLOBAL',
                typeName: 'Global',
                prefix: seriesResp.data.globalConfig.prefix,
                next_folio: seriesResp.data.globalConfig.next_folio,
                originalConfig: seriesResp.data
            }]
    ) : []

    // Filter out Nómina if it's there but user said "quitar la nomina"
    const seriesData = flattenedData.filter(d => d.typeCode !== 'N')
    const hasConfig = !!seriesResp?.data

    const { can, isLoading: isLoadingPermissions } = usePermissions()
    if (!isLoadingPermissions && !can('Ver')) return <NotAuthorized />

    return (
        <SeriesProvider>
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
                        <h2 className='text-2xl font-bold tracking-tight'>Series</h2>
                        <p className='text-muted-foreground'>
                            Gestiona tus facturas y comprobantes fiscales.
                        </p>
                    </div>
                    <SeriesPrimaryButtons showAdd={!hasConfig && !isLoading} />
                </div>
                <SeriesTable
                    data={seriesData as any}
                    search={search}
                    navigate={navigate as any}
                    isLoading={isLoading}
                />
            </Main>

            <SeriesDialogs />
        </SeriesProvider>
    )
}
