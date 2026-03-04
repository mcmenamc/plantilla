import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { InvoiceTypeSelector, type InvoiceType } from './invoice-type-selector'
import { InvoiceFormIngreso } from './invoice-form-ingreso'
import { InvoiceFormEgreso } from './invoice-form-egreso'

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
        <div className='space-y-8'>
            {/* Type Selection Section */}
            <div className='rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm dark:border-zinc-800 dark:bg-black'>
                <h3 className='mb-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400/80'>
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
                ) : selectedType === 'E' ? (
                    <InvoiceFormEgreso
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
    )
}
