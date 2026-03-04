import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsPrimaryButtons } from './components/products-primary-buttons'
import { ProductsProvider } from './components/products-provider'
import { ProductsTable } from './components/products-table'
import { getProductosByWorkCenter } from './data/products-api'
import { usePermissions } from '@/hooks/use-permissions'
import { NotAuthorized } from '@/components/not-authorized'

const route = getRouteApi('/_authenticated/products/')

export function Products() {
    const { can, isLoading: isLoadingPermissions } = usePermissions()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const { selectedWorkCenterId } = useWorkCenterStore()

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products', selectedWorkCenterId],
        queryFn: () => getProductosByWorkCenter(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

    if (!isLoadingPermissions && !can('Ver')) return <NotAuthorized />

    return (
        <ProductsProvider>
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
                        <h2 className='text-2xl font-bold tracking-tight'>Productos</h2>
                        <p className='text-muted-foreground'>
                            Gestiona tus productos y servicios.
                        </p>
                    </div>
                    <ProductsPrimaryButtons />
                </div>
                <ProductsTable
                    data={products}
                    search={search}
                    navigate={navigate as any}
                    isLoading={isLoading}
                />
            </Main>

            <ProductsDialogs />
        </ProductsProvider>
    )
}
