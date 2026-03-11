import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { InvoicesProvider } from '@/features/invoicing/components/invoices-provider'
import { InvoiceCreateView } from '@/features/invoicing/components/invoice-create-view'
import { usePermissions } from '@/hooks/use-permissions'
import { NotAuthorized } from '@/components/not-authorized'

export const Route = createFileRoute('/_authenticated/invoicing/new')({
    component: NewInvoicePage,
})

function NewInvoicePage() {
  const navigate = useNavigate()
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
                <div className='mb-6 flex items-center gap-4'>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => navigate({ to: '/invoicing', search: { page: 1, perPage: 10 } } as any)}
                        title='Regresar'
                    >
                        <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <div>
                        <div className='flex items-center gap-2'>
                            <h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
                                Nueva Factura 4.0
                            </h2>
                            <span className='rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-900/30'>
                                Borrador
                            </span>
                        </div>
                        <p className='text-muted-foreground'>
                            Completa los detalles para generar tu comprobante fiscal.
                        </p>
                    </div>
                </div>
                <div className='mx-auto max-w-full'>
                    <InvoiceCreateView />
                </div>
            </Main>
        </InvoicesProvider>
    )
}
