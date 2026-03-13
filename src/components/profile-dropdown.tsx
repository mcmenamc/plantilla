import { Link } from '@tanstack/react-router'
import { Building2, UserCog, Settings, LogOut, Stamp } from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useAuthStore } from '@/stores/auth-store'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { auth } = useAuthStore()
  const isAdmin = auth.user?.role === 'Admin'

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={auth.user?.imagen || ''} alt={auth.user?.nombre} className='object-cover' />
              <AvatarFallback className='bg-muted'>
                {auth.user?.nombre?.[0]}{auth.user?.apellidos?.[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal border-b pb-2 mb-2'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-semibold'>{auth.user?.nombre} {auth.user?.apellidos}</p>
              <p className='text-muted-foreground text-[11px] leading-none'>
                {auth.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup className='space-y-1'>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to='/timbres' className='flex items-center text-primary font-bold'>
                  <Stamp className="w-5 h-5 text-primary" />
                  Comprar Timbres
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                <UserCog size={16} className='me-2' />
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to='/settings/business'>
                  <Building2 size={16} className='me-2' />
                  Datos Fiscales
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                <Settings size={16} className='me-2' />
                Configuración
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className='my-2' />
          <DropdownMenuItem
            className='text-destructive focus:bg-destructive/10 focus:text-destructive'
            onClick={() => setOpen(true)}
          >
            <LogOut size={16} className='me-2' />
            Cerrar sesión
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
