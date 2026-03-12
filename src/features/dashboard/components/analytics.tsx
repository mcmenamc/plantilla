import { Timer } from 'lucide-react'

interface AnalyticsProps {
  stats?: {
    byType?: { name: string, value: number }[]
    byWorkcenter?: { name: string, value: number }[]
    stamps?: { consumed: number, total: number }
  }
}

export function Analytics({ stats }: AnalyticsProps) {
  const byType = stats?.byType || [
    { name: 'Factura (Ingreso)', value: 78 },
    { name: 'Compl. de Pago', value: 15 },
    { name: 'Nota de Crédito', value: 5 },
    { name: 'Carta Porte', value: 2 },
  ]

  const byWorkcenter = stats?.byWorkcenter || [
    { name: 'Principal', value: 85000 },
    { name: 'Sucursal 1', value: 42000 },
    { name: 'Sucursal 2', value: 31000 },
  ]

  const stampsConsumed = stats?.stamps?.consumed || 428
  const stampsTotal = stats?.stamps?.total || 1500
  const stampPercentage = Math.min(100, Math.round((stampsConsumed / stampsTotal) * 100))

  return (
    <div className='space-y-6'>
      <div>
        <h4 className='text-xs font-bold text-muted-foreground uppercase mb-3 px-1'>Por Tipo de Comprobante</h4>
        <SimpleBarList
          items={byType}
          barClass='bg-primary'
          valueFormatter={(n) => `${n}%`}
        />
      </div>
      
      <div className='pt-2'>
        <h4 className='text-xs font-bold text-muted-foreground uppercase mb-3 px-1'>Ingresos por Centro</h4>
        <SimpleBarList
          items={byWorkcenter}
          barClass='bg-zinc-400 dark:bg-zinc-600'
          valueFormatter={(n) => `$${(n/1000).toFixed(1)}k`}
        />
      </div>

      <div className='bg-primary/5 rounded-xl p-3 border border-primary/10 relative overflow-hidden'>
        <div className='flex items-center justify-between mb-2'>
          <p className='text-[9px] font-bold text-primary uppercase tracking-wider'>Estado de Timbres</p>
          <Timer className='h-3 w-3 text-primary/60' />
        </div>
        <div className='flex justify-between items-end'>
           <span className='text-[11px] font-medium text-zinc-600 dark:text-zinc-400'>Consumo este mes</span>
           <span className='text-xs font-bold tabular-nums'>{stampsConsumed.toLocaleString()} / {stampsTotal.toLocaleString()}</span>
        </div>
        <div className='h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden'>
           <div className='h-full bg-primary rounded-full transition-all duration-1000' style={{ width: `${stampPercentage}%` }} />
        </div>
      </div>
    </div>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className='space-y-4'>
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='text-muted-foreground mb-1.5 truncate text-[11px] font-medium'>
                {i.name}
              </div>
              <div className='bg-muted h-1.5 w-full rounded-full'>
                <div
                  className={`h-1.5 rounded-full transition-all duration-1000 ${barClass}`}
                  style={{ width }}
                />
              </div>
            </div>
            <div className='ps-2 text-[11px] font-bold tabular-nums text-zinc-700 dark:text-zinc-300'>
              {valueFormatter(i.value)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
