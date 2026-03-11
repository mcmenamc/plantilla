import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileText } from 'lucide-react'

export function RecentSales() {
  const invoices = [
    {
      id: "F-1204",
      client: "Inmobiliaria Moderna SA",
      rfc: "IMO010203ABC",
      amount: "+$4,250.00",
      status: "Completado"
    },
    {
      id: "F-1203",
      client: "Juan Pérez García",
      rfc: "PEGJ800101XYZ",
      amount: "+$1,200.00",
      status: "Completado"
    },
    {
      id: "F-1202",
      client: "Servicios Digitales",
      rfc: "SDI101010HJK",
      amount: "+$8,999.00",
      status: "Completado"
    },
    {
      id: "F-1201",
      client: "Papelería del Norte",
      rfc: "PNO150505MNP",
      amount: "+$450.00",
      status: "Completado"
    },
    {
      id: "F-1200",
      client: "Consultoría Especializada",
      rfc: "CES050505RTY",
      amount: "+$2,800.00",
      status: "Completado"
    }
  ]

  return (
    <div className='space-y-6'>
      {invoices.map((inv) => (
        <div key={inv.id} className='flex items-center gap-4'>
          <Avatar className='h-10 w-10 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900'>
            <AvatarFallback className='bg-primary/5 text-primary'>
              <FileText className='h-5 w-5' />
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between gap-2 overflow-hidden'>
            <div className='space-y-1 min-w-0'>
              <p className='text-sm font-bold leading-none truncate'>{inv.client}</p>
              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-bold text-zinc-400 uppercase'>{inv.id}</span>
                <span className='text-[10px] font-medium text-muted-foreground'>{inv.rfc}</span>
              </div>
            </div>
            <div className='font-bold text-right text-sm'>
              {inv.amount}
              <p className='text-[9px] text-emerald-500 font-bold uppercase tracking-wider'>Vigente</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
