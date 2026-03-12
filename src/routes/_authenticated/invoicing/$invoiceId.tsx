import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { InvoicesProvider } from '@/features/invoicing/components/invoices-provider'
import { InvoiceViewPage } from '@/features/invoicing/components/invoice-view-page'
import { usePermissions } from '@/hooks/use-permissions'
import { NotAuthorized } from '@/components/not-authorized'

export const Route = createFileRoute('/_authenticated/invoicing/$invoiceId')({
    component: InvoiceDetailPage,
})

function InvoiceDetailPage() {
    const { invoiceId } = Route.useParams()
    const { can, isLoading: isLoadingPermissions } = usePermissions()

    if (!isLoadingPermissions && !can('Ver')) return <NotAuthorized />

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
                <InvoiceViewPage invoiceId={invoiceId} />
            </Main>
        </InvoicesProvider>
    )
}
