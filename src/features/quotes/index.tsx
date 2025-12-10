import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { QuotesDialogs } from './components/quotes-dialogs'
import { QuotesPrimaryButtons } from './components/quotes-primary-buttons'
import { QuotesProvider } from './components/quotes-provider'
import { QuotesTable } from './components/quotes-table'
import { quotes } from './data/data'

const route = getRouteApi('/_authenticated/quotes/')

export function Quotes() {
    const search = route.useSearch()
    const navigate = route.useNavigate()

    return (
        <QuotesProvider>
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
                        <h2 className='text-2xl font-bold tracking-tight'>Cotizador</h2>
                        <p className='text-muted-foreground'>
                            Crea y gestiona cotizaciones para tus clientes.
                        </p>
                    </div>
                    <QuotesPrimaryButtons />
                </div>
                <QuotesTable data={quotes} search={search} navigate={navigate as any} />
            </Main>

            <QuotesDialogs />
        </QuotesProvider>
    )
}
