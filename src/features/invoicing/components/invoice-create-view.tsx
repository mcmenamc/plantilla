import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoiceTypeSelector, type InvoiceType } from './invoice-type-selector'
import { InvoiceFormIngreso } from './invoice-form-ingreso'

export function InvoiceCreateView() {
    const navigate = useNavigate()
    const [selectedType, setSelectedType] = useState<InvoiceType>('I')

    const handleSuccess = () => {
        navigate({
            to: '/invoicing',
            search: { page: 1, perPage: 10 }
        } as any)
    }

    return (
        <div className='flex flex-col gap-6 md:gap-8 max-w-full overflow-x-hidden p-4 md:p-0'>
            {/* Page Header */}
            <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => navigate({ to: '/invoicing', search: { page: 1, perPage: 10 } } as any)}
                        className='-ml-2 h-8 w-8'
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white'>
                        Nueva Factura 4.0
                    </h1>
                </div>
                <div className='ml-2 md:ml-10 flex items-center gap-2 text-xs md:text-sm text-orange-600'>
                    <span className='font-semibold'>Borrador</span>
                    <span className='text-muted-foreground'>•</span>
                    <span className='text-muted-foreground'>Folio A-1024</span>
                </div>
            </div>

            <div className='space-y-8'>
                {/* Type Selection Section */}
                <div className='rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm dark:border-zinc-800 dark:bg-black'>
                    <h3 className='mb-4 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500'>
                        Tipo de Comprobante
                    </h3>
                    <InvoiceTypeSelector
                        selectedType={selectedType}
                        onSelect={(type) => setSelectedType(type)}
                    />
                </div>

                {/* Form Section */}
                <div className='overflow-hidden'>
                    {selectedType === 'I' ? (
                        <InvoiceFormIngreso
                            onSubmitSuccess={handleSuccess}
                            onCancel={() => navigate({ to: '/invoicing', search: { page: 1, perPage: 10 } } as any)}
                        />
                    ) : (
                        <div className='py-20 text-center text-muted-foreground'>
                            El formulario para el tipo {selectedType} está en desarrollo...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
