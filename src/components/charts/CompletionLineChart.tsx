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
  const styles = {
    grid: 'var(--color-chart-grid)',
    tick: 'var(--color-chart-tick)',
    line: 'var(--color-chart-line)',
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={styles.grid} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: styles.tick }} minTickGap={28} />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 12, fill: styles.tick }}
          width={36}
        />
        <Tooltip formatter={(value: number) => [`${value}%`, 'Completion']} />
        <Line
          type="monotone"
          dataKey="completionRate"
          stroke={styles.line}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
