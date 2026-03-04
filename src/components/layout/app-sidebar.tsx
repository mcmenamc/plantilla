import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { generateNavGroups } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { WorkCenterSwitcher } from './work-center-switcher'
import { usePermissions } from '@/hooks/use-permissions'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { permissions, isLoading } = usePermissions()

  const dynamicNavGroups = generateNavGroups(permissions)
  // const { auth } = useAuthStore()

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <WorkCenterSwitcher />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className='p-4 text-sm text-muted-foreground flex items-center justify-center space-x-2 h-full'>
            <span>Cargando navegación...</span>
          </div>
        ) : (
          dynamicNavGroups.map((props) => (
            <NavGroup key={props.title} {...props} />
          ))
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
