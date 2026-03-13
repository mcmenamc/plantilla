import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ticket, ShieldCheck, AlertCircle } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export function RootDashboard() {
  const navigate = useNavigate()

  return (
    <div className='flex flex-col h-full'>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6 p-8'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Bienvenido, Administrador Root</h1>
          <p className='text-muted-foreground'>
            Panel de control para supervisión y soporte técnico de la plataforma.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <Card className='border-primary/20 bg-primary/5'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Control de Soporte</CardTitle>
              <Ticket className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>Tickets</div>
              <p className='text-xs text-muted-foreground mt-1'>
                Gestiona y responde a los reportes de usuarios.
              </p>
              <Button 
                onClick={() => navigate({ to: '/tickets' })}
                className='w-full mt-4' 
                variant='default'
              >
                Ir a Tickets
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Estado del Sistema</CardTitle>
              <ShieldCheck className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>Operativo</div>
              <p className='text-xs text-muted-foreground mt-1'>
                Todos los servicios están funcionando correctamente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Alertas</CardTitle>
              <AlertCircle className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>0</div>
              <p className='text-xs text-muted-foreground mt-1'>
                No hay alertas críticas pendientes.
              </p>
            </CardContent>
          </Card>
        </div>
      </Main>
    </div>
  )
}
