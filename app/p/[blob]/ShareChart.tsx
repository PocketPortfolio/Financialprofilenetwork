'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Position {
  ticker: string;
  percentage: number;
  [key: string]: any; // Index signature for Recharts compatibility
}

interface ShareChartProps {
  positions: Position[];
}

// Color palette for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function ShareChart({ positions }: ShareChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={positions}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ payload }) => `${payload.ticker}: ${payload.percentage?.toFixed(1) ?? '0'}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="percentage"
        >
          {positions.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => `${value}%`}
          labelFormatter={(label) => `Ticker: ${label}`}
        />
        <Legend 
          formatter={(value, entry) => {
            const payload = entry.payload as Position | undefined;
            return `${value}: ${payload?.percentage ?? 0}%`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

