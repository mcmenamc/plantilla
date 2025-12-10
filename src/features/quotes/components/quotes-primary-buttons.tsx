import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuotes } from './quotes-provider'

export function QuotesPrimaryButtons() {
    const { setOpen } = useQuotes()
    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => setOpen('add')}>
                <span>Nueva Cotización</span> <Plus size={18} />
            </Button>
        </div>
    )
}
