import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { InvoicesProvider } from '@/features/invoicing/components/invoices-provider'
import { InvoiceCreateView } from '@/features/invoicing/components/invoice-create-view'

export const Route = createFileRoute('/_authenticated/invoicing/new')({
    component: NewInvoicePage,
})

function NewInvoicePage() {
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

            <Main>
                <InvoiceCreateView />
            </Main>
        </InvoicesProvider>
    )
}
