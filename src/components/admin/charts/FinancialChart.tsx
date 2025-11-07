// components/admin/charts/FinancialChart.tsx
"use client";

import { formatCurrency } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

// --- REKEBISHO #1: Bainisha 'Type' Sahihi kwa 'data' ---
// Hii 'type' inaakisi 'data structure' tunayoitengeneza kwenye 'lib/dashboard-analytics.ts'
interface ChartDataPoint {
    name: string;      // Mwezi, e.g., "Sep 2025"
    revenue: number;
    expenses: number;
    profit: number;
}

interface FinancialChartProps {
    data: ChartDataPoint[];
}

export default function FinancialChart({ data }: FinancialChartProps) {
    // --- REKEBISHO #2: Fanya 'chart' iendane na 'theme' ---
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#888888' : '#333333';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                {/* --- REKEBISHO #3: Ongeza 'Grid' kwa urahisi wa kusoma --- */}
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

                <XAxis
                    dataKey="name"
                    stroke={tickColor}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke={tickColor}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    // 'tickFormatter' inabaki kama ilivyo, ni sahihi
                    tickFormatter={(value) => formatCurrency(value as number)}
                />
                <Tooltip
                    // --- REKEBISHO #4: Boresha 'Tooltip' ---
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                    // 'formatter' inabaki kama ilivyo, lakini sasa ni 'type-safe'
                    formatter={(value: number, name: string) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Legend iconType="circle" iconSize={10} />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="hsl(var(--primary))" name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}