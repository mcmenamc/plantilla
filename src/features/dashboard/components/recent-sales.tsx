import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileText } from 'lucide-react'

interface RecentInvoicesProps {
  invoices: any[]
}

export function RecentSales({ invoices }: RecentInvoicesProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-8 w-8 text-zinc-300 mb-2" />
        <p className="text-sm text-muted-foreground">No hay facturas recientes</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {invoices.map((inv) => (
        <div key={inv._id} className='flex items-center gap-4'>
          <Avatar className='h-10 w-10 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900'>
            <AvatarFallback className='bg-primary/5 text-primary'>
              <FileText className='h-5 w-5' />
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between gap-2 overflow-hidden'>
            <div className='space-y-1 min-w-0'>
              <p className='text-sm font-bold leading-none truncate'>{inv.customer?.razonSocial || 'Cliente General'}</p>
              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-bold text-zinc-400 uppercase'>{inv.serie}{inv.folio_number}</span>
                <span className='text-[10px] font-medium text-muted-foreground'>{inv.customer?.rfc}</span>
              </div>
            </div>
            <div className='font-bold text-right text-sm'>
              {inv.total.toLocaleString('es-MX', { style: 'currency', currency: inv.moneda || 'MXN' })}
              <p className={`text-[9px] font-bold uppercase tracking-wider ${inv.status === 'valid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                {inv.status === 'valid' ? 'Vigente' : inv.status === 'draft' ? 'Borrador' : inv.status}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
