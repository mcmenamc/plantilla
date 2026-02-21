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
import { ProductsProvider, useProducts } from '@/features/products/components/products-provider'
import { ProductsDeleteDialog } from '@/features/products/components/products-delete-dialog'

export const Route = createFileRoute('/_authenticated/products/$productId/edit')({
    component: EditProduct,
})

function EditProduct() {
    const navigate = useNavigate()
    const { productId } = Route.useParams()

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
                        <h2 className='text-2xl font-bold tracking-tight'>Editar Producto</h2>
                        <p className='text-muted-foreground'>
                            Actualiza la información del producto seleccionado.
                        </p>
                    </div>
                </div>
                <div className='mx-auto max-w-5xl space-y-4'>
                    <ProductsForm productId={productId} />
                    <ProductDeleteSection />
                </div>
            </Main>
        </ProductsProvider>
    )
}

function ProductDeleteSection() {
    const { open, setOpen, currentRow } = useProducts()

    return (
        <>
            {currentRow && (
                <ProductsDeleteDialog
                    open={open === 'delete'}
                    onOpenChange={(val) => setOpen(val ? 'delete' : null)}
                    currentRow={currentRow}
                />
            )}
        </>
    )
}
