import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ConfigDrawer } from '@/components/config-drawer'
import { AdministratorsForm } from '@/features/administrators/components/administrators-form'
import {
  getAdministratorById,
  getModules,
  updatePermissions
} from '@/features/administrators/data/administrators-api'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import { NotAuthorized } from '@/components/not-authorized'

export const Route = createFileRoute('/_authenticated/users/$adminId')({
  component: EditAdministrator,
})

function EditAdministrator() {
  const { can, isLoading: isLoadingPermissions } = usePermissions()
  if (!isLoadingPermissions && !can('Editar')) return <NotAuthorized />
  const { adminId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: modules = [] } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: getModules,
  })

  const { data: currentAdmin, isLoading: loadingAdmins } = useQuery({
    queryKey: ['administrator', adminId],
    queryFn: () => getAdministratorById(adminId),
    enabled: !!adminId,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: updatePermissions,
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['administrators'] })
      navigate({ to: '/users' })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar permisos')
    },
  })

  const handleSubmit = (values: any) => {
    const filteredPermissions = (values.permissions || []).filter(
      (p: any) => p.actions && p.actions.length > 0
    )
    mutate({
      id: adminId,
      data: {
        permissions: filteredPermissions,
        nombre: values.nombre,
        apellidos: values.apellidos,
        email: values.email,
      }
    })
  }

  if (loadingAdmins) {
    return <div>Cargando...</div>
  }

  if (!currentAdmin && !loadingAdmins) {
    return <div>Administrador no encontrado</div>
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
        <div className='mb-6 flex items-center gap-4'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => navigate({ to: '/users' })}
            title='Regresar'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Editar Permisos</h2>
            <p className='text-muted-foreground'>
              Modifica los accesos de {currentAdmin?.user.nombre} en este centro de trabajo.
            </p>
          </div>
        </div>

        <AdministratorsForm
          currentRow={currentAdmin}
          modules={modules}
          onSubmit={handleSubmit}
          isLoading={isPending}
        />
      </Main>
    </>
  )
}
