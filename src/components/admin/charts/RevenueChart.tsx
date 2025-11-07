// components/admin/charts/RevenueChart.tsx
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
    data: { name: string; total: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${formatCurrency(value as number)}`}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(100, 100, 100, 0.1)' }}
                    formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                />
                <Legend />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}