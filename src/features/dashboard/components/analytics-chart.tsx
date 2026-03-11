import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

const data = [
  {
    name: 'Lun',
    timbres: Math.floor(Math.random() * 50) + 10,
    facturas: Math.floor(Math.random() * 40) + 5,
  },
  {
    name: 'Mar',
    timbres: Math.floor(Math.random() * 50) + 10,
    facturas: Math.floor(Math.random() * 40) + 5,
  },
  {
    name: 'Mie',
    timbres: Math.floor(Math.random() * 50) + 10,
    facturas: Math.floor(Math.random() * 40) + 5,
  },
  {
    name: 'Jue',
    timbres: Math.floor(Math.random() * 50) + 10,
    facturas: Math.floor(Math.random() * 40) + 5,
  },
  {
    name: 'Vie',
    timbres: Math.floor(Math.random() * 50) + 10,
    facturas: Math.floor(Math.random() * 40) + 5,
  },
  {
    name: 'Sab',
    timbres: Math.floor(Math.random() * 20) + 5,
    facturas: Math.floor(Math.random() * 10) + 2,
  },
  {
    name: 'Dom',
    timbres: Math.floor(Math.random() * 10) + 1,
    facturas: Math.floor(Math.random() * 5) + 0,
  },
]

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Area
          type='monotone'
          dataKey='timbres'
          name='Timbres'
          stroke='currentColor'
          className='text-primary'
          fill='currentColor'
          fillOpacity={0.15}
        />
        <Area
          type='monotone'
          dataKey='facturas'
          name='Facturas'
          stroke='currentColor'
          className='text-muted-foreground'
          fill='currentColor'
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
