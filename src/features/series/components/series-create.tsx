import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { SeriesForm } from './series-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveSeriesConfig } from '../data/series-api'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function SeriesCreate() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) => saveSeriesConfig(data.workCenter, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['series'] })
            toast.success('Serie creada correctamente')
            navigate({ to: '/series', search: { page: 1, perPage: 10 } })
        },
        onError: (error: any) => {
            toast.error(`Error: ${error.message}`)
        }
    })

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

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex items-center gap-4'>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => navigate({ to: '/series', search: { page: 1, perPage: 10 } })}
                        title='Regresar'
                    >
                        <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Nueva Serie</h2>
                        <p className='text-muted-foreground'>
                            Configura los folios y prefijos para tu facturación.
                        </p>
                    </div>
                </div>

                <div className='mx-auto w-full'>
                    <SeriesForm
                        onSubmit={(data) => mutate(data)}
                        disabled={isPending}
                    />
                </div>
            </Main>
        </>
    )
}
