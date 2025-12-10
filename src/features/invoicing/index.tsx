import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { InvoicesDialogs } from './components/invoices-dialogs'
import { InvoicesPrimaryButtons } from './components/invoices-primary-buttons'
import { InvoicesProvider } from './components/invoices-provider'
import { InvoicesTable } from './components/invoices-table'
import { invoices } from './data/data'

const route = getRouteApi('/_authenticated/invoicing/')

interface InvoicingProps {
    title?: string
    description?: string
}

export function Invoicing({
    title = 'Facturación',
    description = 'Gestiona tus facturas y comprobantes fiscales.',
}: InvoicingProps) {
    const search = route.useSearch()
    const navigate = route.useNavigate()

    return (
        <InvoicesProvider>
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
                        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
                        <p className='text-muted-foreground'>{description}</p>
                    </div>
                    <InvoicesPrimaryButtons />
                </div>
                <InvoicesTable data={invoices} search={search} navigate={navigate as any} />
            </Main>

            <InvoicesDialogs />
        </InvoicesProvider>
    )
}
