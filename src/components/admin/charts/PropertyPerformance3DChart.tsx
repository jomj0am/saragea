// components/admin/charts/PropertyPerformance3DChart.tsx
'use client';

import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';

interface PropertyPerformance3DChartProps {
    data: { name: string; occupancy: number }[];
}

export default function PropertyPerformance3DChart({ data }: PropertyPerformance3DChartProps) {
    const { theme } = useTheme();

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: '{b}: {c}% Occupancy'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: data.map(p => p.name),
            axisLabel: {
                interval: 0,
                rotate: 30,
                color: theme === 'dark' ? '#ccc' : '#333',
            },
        },
        yAxis: {
            type: 'value',
            name: 'Occupancy Rate (%)',
            max: 100,
            axisLabel: { color: theme === 'dark' ? '#ccc' : '#333' },
        },
        series: [{
            type: 'bar',
            data: data.map(p => p.occupancy.toFixed(1)),
            itemStyle: {
                color: 'hsl(var(--primary))',
            },
            emphasis: {
                itemStyle: {
                    color: 'hsl(var(--primary) / 0.8)',
                },
            },
            showBackground: true,
            backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.2)'
            }
        }],
    };

    // Kwa sasa, ECharts haina 'native' 3D nzuri kwa bar charts bila WebGL extensions
    // Tutatumia muonekano wa 'pseudo-3D' kwa kutumia styling na shadows.
    // Kwa 3D halisi, tungehitaji 'echarts-gl'.
    
    return (
        <ReactECharts
            option={option}
            style={{ height: '400px', width: '100%' }}
            theme={theme === 'dark' ? 'dark' : 'light'}
        />
    );
}