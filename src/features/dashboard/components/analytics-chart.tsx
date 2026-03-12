import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

interface AnalyticsChartProps {
  data: {
    name: string
    count: number
  }[]
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={10}
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
          dataKey='count'
          name='Timbres Utilizados'
          stroke='currentColor'
          className='text-primary'
          fill='currentColor'
          fillOpacity={0.15}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
