import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { ProductsForm } from '@/features/products/components/products-form'
import { ProductsProvider } from '@/features/products/components/products-provider'

export const Route = createFileRoute('/_authenticated/products/add')({
    component: AddProduct,
})

function AddProduct() {
    const navigate = useNavigate()

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

            <Main>
                <div className='mb-6 flex items-center gap-4'>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => navigate({ to: '/products', search: { page: 1, perPage: 10 } })}
                        title='Regresar'
                    >
                        <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Nuevo Producto</h2>
                        <p className='text-muted-foreground'>
                            Ingresa los detalles para registrar un nuevo producto o servicio.
                        </p>
                    </div>
                </div>
                <div className='mx-auto max-w-8xl'>
                    <ProductsForm />
                </div>
            </Main>
        </ProductsProvider>
    )
}
