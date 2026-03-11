import { Outlet } from '@tanstack/react-router'
import { Palette, UserCog, Building2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from './components/sidebar-nav'
import { useAuthStore } from '@/stores/auth-store'

export function Settings() {
  const { auth: { user } } = useAuthStore()

  const sidebarNavItems = [
    {
      title: 'Mi Perfil',
      href: '/settings',
      icon: <UserCog size={18} />,
    },
    {
      title: 'Apariencia',
      href: '/settings/appearance',
      icon: <Palette size={18} />,
    },
    ...(user?.role === 'Admin' || user?.role === 'Root' ? [{
      title: 'Datos Fiscales',
      href: '/settings/business',
      icon: <Building2 size={18} />,
    }] : []),
  ]

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Configuración
          </h1>
          <p className='text-muted-foreground'>
            Gestiona la configuración de tu cuenta y preferencias personales.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}

