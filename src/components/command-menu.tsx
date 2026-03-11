import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun, UserPlus, PackagePlus, FileText } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { generateNavGroups } from './layout/data/sidebar-data'
import { usePermissions } from '@/hooks/use-permissions'
import { ScrollArea } from './ui/scroll-area'

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()

  const { permissions } = usePermissions()
  const dynamicNavGroups = React.useMemo(() => generateNavGroups(permissions), [permissions])

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Escribe un comando o realiza una búsqueda...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup heading='Acciones Rápidas'>
            <CommandItem
              onSelect={() => {
                runCommand(() => navigate({ to: '/clients/add' }))
              }}
            >
              <UserPlus className='mr-2 h-4 w-4' />
              <span>Agregar Cliente</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => navigate({ to: '/products/add' }))
              }}
            >
              <PackagePlus className='mr-2 h-4 w-4' />
              <span>Agregar Producto</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => navigate({ to: '/invoicing/new' as any }))
              }}
            >
              <FileText className='mr-2 h-4 w-4' />
              <span>Crear Factura</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          {dynamicNavGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => navigate({ to: navItem.url }))
                      }}
                    >
                      <div className='flex size-4 items-center justify-center'>
                        <ArrowRight className='text-muted-foreground/80 size-2' />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  )

                return navItem.items?.map((subItem, i) => (
                  <CommandItem
                    key={`${navItem.title}-${subItem.url}-${i}`}
                    value={`${navItem.title}-${subItem.url}`}
                    onSelect={() => {
                      runCommand(() => navigate({ to: subItem.url }))
                    }}
                  >
                    <div className='flex size-4 items-center justify-center'>
                      <ArrowRight className='text-muted-foreground/80 size-2' />
                    </div>
                    {navItem.title} <ChevronRight /> {subItem.title}
                  </CommandItem>
                ))
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading='Tema'>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun /> <span>Claro</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className='scale-90' />
              <span>Oscuro</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop />
              <span>Sistema</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
