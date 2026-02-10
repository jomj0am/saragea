// components/admin/charts/OccupancyRadialChart.tsx
'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface OccupancyRadialChartProps {
    paymentRate: number;
}

export default function OccupancyRadialChart({ paymentRate }: OccupancyRadialChartProps) {
    const data = [{ name: 'Payment Rate', value: paymentRate, fill: 'hsl(var(--primary))' }];

    return (
        <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
                innerRadius="80%"
                outerRadius="100%"
                barSize={15}
                data={data}
                startAngle={90}
                endAngle={-270}
            >
                <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                />
                <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-4xl font-bold"
                >
                    {`${paymentRate.toFixed(1)}%`}
                </text>
                <text
                    x="50%"
                    y="65%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-sm"
                >
                    Paid
                </text>
            </RadialBarChart>
        </ResponsiveContainer>
    );
}