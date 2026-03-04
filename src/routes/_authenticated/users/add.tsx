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
import { createAdministrator, getModules } from '@/features/administrators/data/administrators-api'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useWorkCenterStore } from '@/stores/work-center-store'

export const Route = createFileRoute('/_authenticated/users/add')({
    component: AddAdministrator,
})

function AddAdministrator() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { selectedWorkCenterId } = useWorkCenterStore()

    const { data: modules = [] } = useQuery({
        queryKey: ['admin-modules'],
        queryFn: getModules,
    })

    const { mutate, isPending } = useMutation({
        mutationFn: createAdministrator,
        onSuccess: (data) => {
            toast.success(data.message)
            queryClient.invalidateQueries({ queryKey: ['administrators'] })
            navigate({ to: '/users' })
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || 'Error al crear administrador')
        },
    })

    const handleSubmit = (values: any) => {
        const filteredPermissions = (values.permissions || []).filter(
            (p: any) => p.actions && p.actions.length > 0
        )
        mutate({ ...values, permissions: filteredPermissions, workCenterId: selectedWorkCenterId })
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
                        <h2 className='text-2xl font-bold tracking-tight'>Nuevo Administrador</h2>
                        <p className='text-muted-foreground'>
                            Completa los datos para asignar permisos en este centro de trabajo.
                        </p>
                    </div>
                </div>

                <AdministratorsForm
                    modules={modules}
                    onSubmit={handleSubmit}
                    isLoading={isPending}
                />
            </Main>
        </>
    )
}
