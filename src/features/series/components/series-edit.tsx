import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { SeriesForm } from './series-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSeriesById, updateSeries } from '../data/series-api'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface SeriesEditProps {
    seriesId: string
}

export function SeriesEdit({ seriesId }: SeriesEditProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: seriesResp, isLoading } = useQuery({
        queryKey: ['series', seriesId],
        queryFn: () => getSeriesById(seriesId),
        enabled: !!seriesId,
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) => updateSeries(seriesId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['series'] })
            toast.success('Serie actualizada correctamente')
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
                        <h2 className='text-2xl font-bold tracking-tight'>Editar Serie</h2>
                        <p className='text-muted-foreground'>
                            Modifica los folios y prefijos para este centro de trabajo.
                        </p>
                    </div>
                </div>

                <div className='mx-auto w-full'>
                    {isLoading ? (
                        <div className='flex h-64 items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        </div>
                    ) : (
                        <SeriesForm
                            initialData={seriesResp?.data || undefined}
                            onSubmit={(data) => mutate(data)}
                            disabled={isPending}
                        />
                    )}
                </div>
            </Main>
        </>
    )
}
