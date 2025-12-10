import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export function Catalogs() {
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

            <Main>
                <div className='flex items-center justify-between space-y-2'>
                    <h2 className='text-3xl font-bold tracking-tight'>Catálogos SAT</h2>
                    <p className='text-muted-foreground'>
                        Consulta los catálogos oficiales del SAT.
                    </p>
                </div>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {[
                        'Clave ProdServ',
                        'Clave Unidad',
                        'Forma de Pago',
                        'Método de Pago',
                        'Régimen Fiscal',
                        'Uso CFDI',
                        'Tipo de Comprobante',
                        'Moneda',
                        'País',
                        'Código Postal',
                    ].map((catalog) => (
                        <Card key={catalog} className='hover:bg-muted/50 cursor-pointer transition-colors'>
                            <CardHeader>
                                <CardTitle>{catalog}</CardTitle>
                                <CardDescription>Catálogo oficial del SAT</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm text-muted-foreground'>
                                    Haz clic para ver los detalles y buscar claves.
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Main>
        </>
    )
}
