'use client';

import { ReactNode } from 'react';
import {
    PieChart as RechartsPie,
    Pie,
    Cell,
    BarChart as RechartsBar,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    AreaChart as RechartsArea,
    Area,
    ResponsiveContainer,
    LineChart as RechartsLine,
    Line,
} from 'recharts';

// Color Palettes
const COLORS = {
    primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
    danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
    mixed: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
    gradient: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
};

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg p-3">
                {label && <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{label}</p>}
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

// Chart Card Wrapper
interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}

export function ChartCard({ title, subtitle, children, className = '', action }: ChartCardProps) {
    return (
        <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm ${className}`}>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                    {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

// Donut/Pie Chart
interface DonutChartProps {
    data: Array<{ name: string; value: number; color?: string }>;
    height?: number;
    innerRadius?: number;
    showLegend?: boolean;
    showLabels?: boolean;
}

export function DonutChart({ data, height = 300, innerRadius = 60, showLegend = true, showLabels = false }: DonutChartProps) {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div className="relative">
            <ResponsiveContainer width="100%" height={height}>
                <RechartsPie>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={innerRadius + 40}
                        paddingAngle={2}
                        dataKey="value"
                        label={showLabels ? ({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%` : undefined}
                        labelLine={showLabels}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS.mixed[index % COLORS.mixed.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && (
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: 20 }}
                            formatter={(value) => <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>}
                        />
                    )}
                </RechartsPie>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: showLegend ? -20 : 0 }}>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{total}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
            </div>
        </div>
    );
}

// Bar Chart
interface BarChartData {
    name: string;
    [key: string]: string | number;
}

interface BarChartProps {
    data: BarChartData[];
    dataKeys: Array<{ key: string; color: string; name?: string }>;
    height?: number;
    layout?: 'horizontal' | 'vertical';
    showGrid?: boolean;
    stacked?: boolean;
}

export function BarChart({ data, dataKeys, height = 300, layout = 'vertical', showGrid = true, stacked = false }: BarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBar data={data} layout={layout} barCategoryGap="20%">
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />}
                {layout === 'vertical' ? (
                    <>
                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                    </>
                ) : (
                    <>
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    </>
                )}
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                <Legend formatter={(value) => <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>} />
                {dataKeys.map((dk, index) => (
                    <Bar
                        key={dk.key}
                        dataKey={dk.key}
                        name={dk.name || dk.key}
                        fill={dk.color}
                        radius={[4, 4, 4, 4]}
                        stackId={stacked ? 'stack' : undefined}
                    />
                ))}
            </RechartsBar>
        </ResponsiveContainer>
    );
}

// Area Chart
interface AreaChartProps {
    data: Array<{ name: string;[key: string]: string | number }>;
    dataKeys: Array<{ key: string; color: string; name?: string }>;
    height?: number;
    showGrid?: boolean;
    gradientFill?: boolean;
}

export function AreaChart({ data, dataKeys, height = 300, showGrid = true, gradientFill = true }: AreaChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsArea data={data}>
                <defs>
                    {dataKeys.map((dk) => (
                        <linearGradient key={dk.key} id={`gradient-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={dk.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={dk.color} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />}
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>} />
                {dataKeys.map((dk) => (
                    <Area
                        key={dk.key}
                        type="monotone"
                        dataKey={dk.key}
                        name={dk.name || dk.key}
                        stroke={dk.color}
                        strokeWidth={2}
                        fill={gradientFill ? `url(#gradient-${dk.key})` : dk.color}
                        fillOpacity={gradientFill ? 1 : 0.1}
                    />
                ))}
            </RechartsArea>
        </ResponsiveContainer>
    );
}

// Line Chart
interface LineChartProps {
    data: Array<{ name: string;[key: string]: string | number }>;
    dataKeys: Array<{ key: string; color: string; name?: string }>;
    height?: number;
    showGrid?: boolean;
    showDots?: boolean;
}

export function LineChart({ data, dataKeys, height = 300, showGrid = true, showDots = true }: LineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLine data={data}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />}
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>} />
                {dataKeys.map((dk) => (
                    <Line
                        key={dk.key}
                        type="monotone"
                        dataKey={dk.key}
                        name={dk.name || dk.key}
                        stroke={dk.color}
                        strokeWidth={2}
                        dot={showDots ? { fill: dk.color, strokeWidth: 2, r: 4 } : false}
                        activeDot={{ r: 6, fill: dk.color }}
                    />
                ))}
            </RechartsLine>
        </ResponsiveContainer>
    );
}

// Mini Sparkline Chart
interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
    showArea?: boolean;
}

export function Sparkline({ data, color = '#3b82f6', height = 40, showArea = true }: SparklineProps) {
    const chartData = data.map((value, index) => ({ name: index.toString(), value }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsArea data={chartData}>
                <defs>
                    <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    fill={showArea ? 'url(#sparklineGradient)' : 'none'}
                />
            </RechartsArea>
        </ResponsiveContainer>
    );
}

// Progress Ring
interface ProgressRingProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
}

export function ProgressRing({ value, max = 100, size = 120, strokeWidth = 10, color = '#3b82f6', label }: ProgressRingProps) {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-200 dark:text-slate-700"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(percentage)}%</span>
                {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>}
            </div>
        </div>
    );
}

// Metric Card with Sparkline
interface MetricCardProps {
    title: string;
    value: string | number;
    change?: { value: number; isPositive: boolean };
    sparklineData?: number[];
    icon?: ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorMap = {
    blue: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', spark: '#3b82f6' },
    green: { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', spark: '#10b981' },
    purple: { gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', spark: '#8b5cf6' },
    orange: { gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', spark: '#f59e0b' },
    red: { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', spark: '#ef4444' },
};

export function MetricCard({ title, value, change, sparklineData, icon, color = 'blue' }: MetricCardProps) {
    const colors = colorMap[color];

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${colors.bg}`}>
                    {icon || (
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.gradient}`} />
                    )}
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${change.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span>{change.isPositive ? '↑' : '↓'}</span>
                        <span>{Math.abs(change.value)}%</span>
                    </div>
                )}
            </div>
            <div className="mb-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
            {sparklineData && sparklineData.length > 0 && (
                <div className="mt-3 -mx-1">
                    <Sparkline data={sparklineData} color={colors.spark} height={35} />
                </div>
            )}
        </div>
    );
}

export { COLORS };
