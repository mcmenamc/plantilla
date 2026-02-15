import { Building2 } from 'lucide-react'
import { WorkCenter } from '../data/schema'
import { useWorkCenters } from './work-centers-provider'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface WorkCentersLogoColumnProps {
    row: WorkCenter
}

export function WorkCentersLogoColumn({ row }: WorkCentersLogoColumnProps) {
    const { setOpen, setCurrentRow } = useWorkCenters()

    if (!row.imagen) {
        return (
            <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border shadow-sm'>
                <Building2 className='w-5 h-5 text-muted-foreground/50' />
            </div>
        )
    }

    const handleClick = () => {
        setCurrentRow(row)
        setOpen('upload-logo')
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div
                        onClick={handleClick}
                        className='relative w-10 h-10 rounded-full overflow-hidden border border-border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all group'
                    >
                        <img
                            src={row.imagen}
                            alt={row.workcenterName}
                            className='w-full h-full object-cover'
                        />
                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors' />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className='text-xs'>Clic para actualizar logo</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
