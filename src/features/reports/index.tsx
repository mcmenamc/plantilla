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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Overview } from '@/features/dashboard/components/overview'
import { RecentSales } from '@/features/dashboard/components/recent-sales'
import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '@/features/dashboard/data/dashboard-api'
import { useMemo } from 'react'
import { TrendingUp, FileCheck, CircleDollarSign, BarChart3, Loader2 } from 'lucide-react'

export function Reports() {
    const { data: dashData, isLoading } = useQuery({
        queryKey: ['dashboard-data', 'all'],
        queryFn: () => getDashboardData('all'),
    })

    const processedBillingHistory = useMemo(() => {
        if (!dashData?.billingHistory) return []
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        return dashData.billingHistory.map((item: any) => ({
            name: `${months[item._id.month - 1]} ${item._id.year}`,
            total: item.total
        }))
    }, [dashData])

    if (isLoading) {
        return (
            <div className='flex h-[80vh] items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        )
    }

    const summary = dashData?.summary || {
        totalBilled: 0,
        timbresLibres: 0,
        pendingInvoicesCount: 0,
        activeClientsCount: 0
    }

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
                <div className='flex items-center justify-between space-y-2 mb-6'>
                    <div>
                        <h2 className='text-3xl font-bold tracking-tight'>Reporte de Ventas</h2>
                        <p className='text-muted-foreground'>Resumen ejecutivo de ingresos y facturación.</p>
                    </div>
                </div>
                <Tabs defaultValue='overview' className='space-y-4'>
                    <TabsList>
                        <TabsTrigger value='overview'>Resumen</TabsTrigger>
                        <TabsTrigger value='analytics' disabled>
                            Analíticas
                        </TabsTrigger>
                        <TabsTrigger value='reports' disabled>
                            Descargar
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value='overview' className='space-y-4'>
                        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                            <Card className='border-l-4 border-l-emerald-500 shadow-sm'>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                                        Ingresos Totales (Mes)
                                    </CardTitle>
                                    <TrendingUp className='h-4 w-4 text-emerald-500' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>{summary.totalBilled.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
                                    <p className='text-[10px] text-muted-foreground mt-1'>
                                        Monto acumulado facturado
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className='border-l-4 border-l-blue-500 shadow-sm'>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                                        Timbres Restantes
                                    </CardTitle>
                                    <BarChart3 className='h-4 w-4 text-blue-500' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>{summary.timbresLibres.toLocaleString()}</div>
                                    <p className='text-[10px] text-muted-foreground mt-1'>
                                        Folios disponibles para emitir
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className='border-l-4 border-l-orange-500 shadow-sm'>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Por Cobrar</CardTitle>
                                    <CircleDollarSign className='h-4 w-4 text-orange-500' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>{summary.pendingInvoicesCount}</div>
                                    <p className='text-[10px] text-muted-foreground mt-1'>
                                        Comprobantes pendientes de pago
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className='border-l-4 border-l-primary shadow-sm'>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                                        Facturas Emitidas
                                    </CardTitle>
                                    <FileCheck className='h-4 w-4 text-primary' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>{dashData?.recentInvoices?.length || 0}</div>
                                    <p className='text-[10px] text-muted-foreground mt-1'>
                                        Registros recientes en el sistema
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7'>
                            <Card className='col-span-4 shadow-sm'>
                                <CardHeader>
                                    <CardTitle className='text-lg font-bold'>Histórico de Ventas</CardTitle>
                                    <CardDescription className='text-xs'>Ingresos acumulados por mes</CardDescription>
                                </CardHeader>
                                <CardContent className='pl-2'>
                                    <Overview data={processedBillingHistory} />
                                </CardContent>
                            </Card>
                            <Card className='col-span-3 shadow-sm'>
                                <CardHeader>
                                    <CardTitle className='text-lg font-bold'>Transacciones Recientes</CardTitle>
                                    <CardDescription className='text-xs'>
                                        Últimos movimientos detectados en la plataforma.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RecentSales invoices={dashData?.recentInvoices || []} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </Main>
        </>
    )
}
