import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Analytics } from './components/analytics'
import { AnalyticsChart } from './components/analytics-chart'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { Users, FileCheck, TrendingUp, Timer, FileSpreadsheet, PlusCircle, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getWorkCenters } from '../work-centers/data/work-centers-api'
import { getDashboardData } from './data/dashboard-api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useState, useMemo } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { NotAuthorized } from '@/components/not-authorized'
import { useAuthStore } from '@/stores/auth-store'
import { useNavigate } from '@tanstack/react-router'

export function Dashboard() {
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const [selectedWorkCenter, setSelectedWorkCenter] = useState('all')

  const isAdmin = auth.user?.role === 'Admin' || auth.user?.role === 'SuperAdmin'

  // Fetch workcenters if admin to populate the filter
  const { data: workCenters = [], isLoading: isLoadingWCs } = useQuery({
    queryKey: ['work-centers-list'],
    queryFn: getWorkCenters,
    enabled: isAdmin
  })

  // Fetch dashboard data based on selected workcenter
  const { data: dashData, isLoading: isLoadingDash } = useQuery({
    queryKey: ['dashboard-data', selectedWorkCenter],
    queryFn: () => getDashboardData(selectedWorkCenter),
    // If not admin, the backend will automatically filter by user's assigned workcenters
    // but we still want to fetch it.
  })

  const { can, isLoading: isLoadingPermissions } = usePermissions()

  // Transform billing history for the Overview chart
  const processedBillingHistory = useMemo(() => {
    if (!dashData?.billingHistory) return []
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return dashData.billingHistory.map((item: any) => ({
      name: `${months[item._id.month - 1]} ${item._id.year}`,
      total: item.total
    }))
  }, [dashData])

  // Transform stamp usage for AnalyticsChart
  const processedStampUsage = useMemo(() => {
    if (!dashData?.stampUsage) return []
    return dashData.stampUsage.map((item: any) => ({
      name: item._id.split('-').slice(1).join('/'), // DD/MM pattern
      count: item.count
    }))
  }, [dashData])

  if (!isLoadingPermissions && !can('Ver')) return <NotAuthorized />

  if (isLoadingDash) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <Header>
        <div className='ml-auto flex items-center gap-2 sm:gap-4'>
          {isAdmin && (
            <div className="hidden sm:block w-40 md:w-56 lg:w-64">
              <Select
                value={selectedWorkCenter}
                onValueChange={setSelectedWorkCenter}
                disabled={isLoadingWCs}
              >
                <SelectTrigger className="h-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder={isLoadingWCs ? "..." : "Filtrar por Centro"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Centros</SelectItem>
                  {workCenters?.map((wc: any) => (
                    <SelectItem key={wc._id} value={wc._id}>{wc.workcenterName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className='flex items-center gap-1 sm:gap-2'>
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </div>
      </Header>

      <Main className='space-y-6'>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Panel de Control</h1>
            <p className='text-muted-foreground text-sm'>Gestión inmediata de folios, facturas y métricas fiscales.</p>
          </div>
          <div className='flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0'>
            {/* <Button variant='outline' className='flex-1 md:flex-none h-10 border-zinc-200 dark:border-zinc-800 text-sm'>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button> */}
            <Button 
              onClick={() => navigate({ to: '/invoicing' })}
              className='flex-1 md:flex-none h-10 text-sm shadow-md shadow-primary/20'
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Factura
            </Button>
          </div>
        </div>

        {isAdmin && (
          <div className="sm:hidden w-full">
            <Select
              value={selectedWorkCenter}
              onValueChange={setSelectedWorkCenter}
              disabled={isLoadingWCs}
            >
              <SelectTrigger className="w-full h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm">
                <SelectValue placeholder={isLoadingWCs ? "Cargando centros..." : "Filtrar por Centro"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Centros</SelectItem>
                {workCenters?.map((wc: any) => (
                  <SelectItem key={wc._id} value={wc._id}>{wc.workcenterName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* --- Main Dashboard Stats --- */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='relative overflow-hidden border-zinc-100 dark:border-zinc-800/50 shadow-sm bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/30'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-[11px] font-bold uppercase tracking-wider text-zinc-500'>Total Facturado</CardTitle>
              <div className='p-1.5 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-lg'>
                <TrendingUp className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100'>
                {summary.totalBilled.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
              </div>
              <p className='text-zinc-500 text-[10px] font-medium mt-1 uppercase tracking-tight'>Monto acumulado del mes</p>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-primary shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-orange-50/20 dark:from-zinc-950 dark:to-orange-950/10'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-[11px] font-bold text-primary uppercase tracking-wider'>Timbres Libres</CardTitle>
              <div className='p-1.5 bg-primary/10 rounded-lg'>
                <Timer className="h-3.5 w-3.5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100'>
                {summary.timbresLibres.toLocaleString()}
              </div>
              <p className='text-zinc-500 text-[10px] font-medium mt-1 leading-tight'>Folios listos para emitir</p>
            </CardContent>
          </Card>

          <Card className='shadow-sm border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-br from-white to-blue-50/20 dark:from-zinc-950 dark:to-blue-950/10'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-[11px] font-bold uppercase tracking-wider text-zinc-500'>Pendientes</CardTitle>
              <div className='p-1.5 bg-blue-100/50 dark:bg-blue-500/10 rounded-lg'>
                <FileCheck className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100'>
                {summary.pendingInvoicesCount}
              </div>
              <p className='text-zinc-500 text-[10px] font-medium mt-1 uppercase tracking-tight'>Borradores o por cobrar</p>
            </CardContent>
          </Card>

          <Card className='shadow-sm border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-br from-white to-purple-50/20 dark:from-zinc-950 dark:to-purple-950/10'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-[11px] font-bold uppercase tracking-wider text-zinc-500'>Clientes en Centros</CardTitle>
              <div className='p-1.5 bg-purple-100/50 dark:bg-purple-500/10 rounded-lg'>
                <Users className='h-3.5 w-3.5 text-purple-600 dark:text-purple-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100'>
                {summary.activeClientsCount}
              </div>
              <p className='text-zinc-500 text-[10px] font-medium mt-1 uppercase tracking-tight'>Cartera asignada</p>
            </CardContent>
          </Card>
        </div>

        {/* --- Charts Section --- */}
        <div className='grid grid-cols-1 lg:grid-cols-7 gap-6'>
          <Card className='lg:col-span-4 shadow-sm border-none bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-950 dark:to-zinc-900/30'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0'>
              <div>
                <CardTitle className="text-lg font-bold">Historial de Facturación</CardTitle>
                <CardDescription className="text-xs">Ingresos mensuales totales</CardDescription>
              </div>
            </CardHeader>
            <CardContent className='pt-4 px-2'>
              <Overview data={processedBillingHistory} />
            </CardContent>
          </Card>

          <Card className='lg:col-span-3 shadow-sm border-zinc-100 dark:border-zinc-800/50'>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-bold">Facturas Recientes</CardTitle>
              <CardDescription className="text-xs">Últimos comprobantes editados o emitidos</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales invoices={dashData?.recentInvoices || []} />
              <div className='mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-center'>
                <Button 
                  onClick={() => navigate({ to: '/invoicing' })}
                  variant='link' 
                  className='p-0 h-auto text-[10px] text-primary font-bold uppercase tracking-widest hover:no-underline'
                >
                  Ir al listado completo ➔
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Lower Stats Grid --- */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Card className='shadow-none bg-zinc-50/30 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60'>
            <CardHeader className="pb-4">
              <CardTitle className='text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400/80'>Resumen de Operación</CardTitle>
            </CardHeader>
            <CardContent>
              <Analytics stats={dashData?.analytics} />
            </CardContent>
          </Card>

          <Card className='lg:col-span-2 shadow-sm border-zinc-100 dark:border-zinc-800/50'>
            <CardHeader className='pb-4'>
              <CardTitle className="text-md font-bold">Uso de Timbres (Consumo Reciente)</CardTitle>
              <CardDescription className="text-xs text-zinc-500">Folios fiscales consumidos en los últimos días</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart data={processedStampUsage} />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
