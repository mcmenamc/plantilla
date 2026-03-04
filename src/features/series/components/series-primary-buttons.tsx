import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SeriesPrimaryButtonsProps {
    showAdd?: boolean
}

export function SeriesPrimaryButtons({ showAdd = true }: SeriesPrimaryButtonsProps) {
    const navigate = useNavigate()

    if (!showAdd) return null

    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => navigate({ to: '/series/create' })}>
                <span>Nueva Serie</span> <Plus size={18} />
            </Button>
        </div>
    )
}
