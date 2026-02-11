import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type CompletionDataPoint = {
  date: string
  completionRate: number
}

type CompletionLineChartProps = {
  data: CompletionDataPoint[]
}

export const CompletionLineChart = ({ data }: CompletionLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <Tooltip formatter={(value: number) => [`${value}%`, 'Completion']} />
        <Line
          type="monotone"
          dataKey="completionRate"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
