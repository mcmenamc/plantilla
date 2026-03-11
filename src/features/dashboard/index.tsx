import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Analytics } from './components/analytics'
import { AnalyticsChart } from './components/analytics-chart'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { Users, FileCheck, Zap, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getWorkCenters } from '../work-centers/data/work-centers-api'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useState } from 'react'
import { Timer, LayoutDashboard, FileSpreadsheet, PlusCircle } from 'lucide-react'

export function Dashboard() {
  const [selectedWorkCenter, setSelectedWorkCenter] = useState('all')
  
  // Check if admin (this would normally come from an auth hook, 
  // using a dummy true for demonstration based on the request)
  const isAdmin = true 

  const { data: workCenters = [], isLoading } = useQuery({
    queryKey: ['work-centers', selectedWorkCenter],
    queryFn: getWorkCenters,
    enabled: isAdmin
  })

  return (
    <>
      <Header>
        
        <div className='ml-auto flex items-center gap-2 sm:gap-4'>
          {isAdmin && (
            <div className="hidden sm:block w-40 md:w-56 lg:w-64">
              <Select 
                value={selectedWorkCenter} 
                onValueChange={setSelectedWorkCenter}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder={isLoading ? "..." : "Filtrar por Centro"} />
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
            <Button variant='outline' className='flex-1 md:flex-none h-10 border-zinc-200 dark:border-zinc-800 text-sm'>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button className='flex-1 md:flex-none h-10 text-sm shadow-md shadow-primary/20'>
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
              disabled={isLoading}
            >
              <SelectTrigger className="w-full h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm">
                <SelectValue placeholder={isLoading ? "Cargando centros..." : "Filtrar por Centro"} />
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
              <div className='text-3xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100'>$45,231.89</div>
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
              <div className='text-3xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100'>1,250</div>
              <p className='text-zinc-500 text-[10px] font-medium mt-1 leading-tight'>Folios listos para emitir</p>
            </CardContent>
          </Card>

          <Card className='shadow-sm border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-br from-white to-blue-50/20 dark:from-zinc-950 dark:to-blue-950/10'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-[11px] font-bold uppercase tracking-wider text-zinc-500'>Faltan por Cobrar</CardTitle>
              <div className='p-1.5 bg-blue-100/50 dark:bg-blue-500/10 rounded-lg'>
                <FileCheck className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100'>234</div>
              <p className='text-zinc-500 text-[10px] font-medium mt-1 uppercase tracking-tight'>Facturas vigentes hoy</p>
            </CardContent>
          </Card>

          <Card className='shadow-sm border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-br from-white to-purple-50/20 dark:from-zinc-950 dark:to-purple-950/10'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-[11px] font-bold uppercase tracking-wider text-zinc-500'>Clientes Activos</CardTitle>
              <div className='p-1.5 bg-purple-100/50 dark:bg-purple-500/10 rounded-lg'>
                <Users className='h-3.5 w-3.5 text-purple-600 dark:text-purple-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100'>57</div>
              <p className='text-zinc-500 text-[10px] font-medium mt-1 uppercase tracking-tight'>Cartera total de clientes</p>
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
              <div className='hidden md:block'>
                <Button variant='ghost' size='sm' className='text-[10px] font-bold uppercase tracking-tighter'>Este Año</Button>
              </div>
            </CardHeader>
            <CardContent className='pt-4 px-2'>
              <Overview />
            </CardContent>
          </Card>

          <Card className='lg:col-span-3 shadow-sm border-zinc-100 dark:border-zinc-800/50'>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-bold">Facturas Recientes</CardTitle>
              <CardDescription className="text-xs">Últimos comprobantes emitidos</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales />
              <div className='mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-center'>
                <Button variant='link' className='p-0 h-auto text-[10px] text-primary font-bold uppercase tracking-widest hover:no-underline'>
                  Ver todo el historial ➔
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Lower Stats Grid --- */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
           <Card className='shadow-none bg-zinc-50/30 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60'>
             <CardHeader className="pb-4">
                <CardTitle className='text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400/80'>Distribución Fiscal</CardTitle>
             </CardHeader>
             <CardContent>
                <Analytics />
             </CardContent>
           </Card>
           
           <Card className='lg:col-span-2 shadow-sm border-zinc-100 dark:border-zinc-800/50'>
              <CardHeader className='pb-4'>
                <CardTitle className="text-md font-bold">Uso de Timbres (Consumo Semanal)</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Folios fiscales consumidos por día</CardDescription>
              </CardHeader>
              <CardContent>
                 <AnalyticsChart />
              </CardContent>
           </Card>
        </div>
      </Main>
    </>
  )
}

const topNav: any[] = []
