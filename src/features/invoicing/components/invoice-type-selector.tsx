import { LucideIcon, Banknote, Receipt, Truck, Users, CircleDollarSign, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type InvoiceType = 'I' | 'E' | 'P' | 'N' | 'T'

interface InvoiceTypeOption {
    id: InvoiceType
    title: string
    icon: LucideIcon
}

const invoiceTypes: InvoiceTypeOption[] = [
    { id: 'I', title: 'Ingresos', icon: CircleDollarSign },
    { id: 'E', title: 'Egresos', icon: Receipt },
    { id: 'T', title: 'Traslado', icon: Truck },
    { id: 'P', title: 'Pago', icon: Banknote },
    { id: 'N', title: 'Nómina', icon: Users },
]

interface InvoiceTypeSelectorProps {
    selectedType: InvoiceType
    onSelect: (type: InvoiceType) => void
}

export function InvoiceTypeSelector({ selectedType, onSelect }: InvoiceTypeSelectorProps) {
    return (
        <Card className='border-none shadow-none bg-transparent'>
            <CardContent className='p-0'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4'>
                    {invoiceTypes.map((type) => {
                        const isSelected = selectedType === type.id
                        return (
                            <button
                                key={type.id}
                                type='button'
                                onClick={() => onSelect(type.id)}
                                className={cn(
                                    'group relative flex items-center gap-3 rounded-xl border-2 p-3 md:p-4 text-left transition-all duration-200 w-full',
                                    isSelected
                                        ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-1 ring-orange-100 dark:bg-orange-950/20 dark:ring-orange-900/30'
                                        : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30 dark:border-zinc-800 dark:bg-black hover:dark:border-orange-900/50'
                                )}
                            >
                                <div className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                                    isSelected
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-500 dark:bg-zinc-900 dark:text-zinc-400'
                                )}>
                                    <type.icon size={20} />
                                </div>
                                <span className={cn(
                                    'font-semibold tracking-tight',
                                    isSelected ? 'text-orange-950 dark:text-orange-100' : 'text-slate-700 dark:text-zinc-300'
                                )}>
                                    {type.title}
                                </span>

                                {isSelected && (
                                    <div className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shadow-md ring-2 ring-white dark:ring-black'>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
