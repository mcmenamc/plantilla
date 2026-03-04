import { LucideIcon, Banknote, Receipt, Truck, CircleDollarSign, Check } from 'lucide-react'
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
    { id: 'P', title: 'Pago', icon: Banknote }
]

interface InvoiceTypeSelectorProps {
    selectedType: InvoiceType
    onSelect: (type: InvoiceType) => void
}

export function InvoiceTypeSelector({ selectedType, onSelect }: InvoiceTypeSelectorProps) {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            {invoiceTypes.map((type) => {
                const isSelected = selectedType === type.id
                return (
                    <button
                        key={type.id}
                        type='button'
                        onClick={() => onSelect(type.id)}
                        className={cn(
                            'group relative flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all duration-300 w-full bg-white dark:bg-zinc-950',
                            isSelected
                                ? 'border-orange-500 shadow-md ring-1 ring-orange-100 dark:ring-orange-900/30'
                                : 'border-slate-100 hover:border-orange-200 hover:bg-orange-50/10 dark:border-zinc-800'
                        )}
                    >
                        <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300',
                            isSelected
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-none'
                                : 'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 dark:bg-zinc-900 dark:text-zinc-600'
                        )}>
                            <type.icon size={18} strokeWidth={2.5} />
                        </div>
                        <span className={cn(
                            'text-xs font-bold tracking-tight transition-colors',
                            isSelected ? 'text-slate-900 dark:text-orange-50' : 'text-slate-600 dark:text-zinc-400'
                        )}>
                            {type.title}
                        </span>

                        {isSelected && (
                            <div className='absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white shadow-md ring-2 ring-white dark:ring-zinc-950'>
                                <Check size={12} strokeWidth={3} />
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
