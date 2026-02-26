'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    hover?: boolean;
    padding?: 'sm' | 'md' | 'lg' | 'none';
}

export default function Card({
    children,
    title,
    subtitle,
    className = '',
    hover = false,
    padding = 'md',
}: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={`
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                rounded-2xl shadow-sm
                ${hover ? 'hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200' : ''}
                ${paddingClasses[padding]}
                ${className}
            `}
        >
            {(title || subtitle) && (
                <div className={`${padding !== 'none' ? 'mb-4' : 'p-6 pb-0'}`}>
                    {title && (
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}

// Stat Card for dashboards
interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: { value: number; isPositive: boolean };
    gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function StatCard({ title, value, icon, trend, gradient }: StatCardProps) {
    const gradientClasses = {
        blue: 'from-blue-600 to-cyan-600',
        green: 'from-emerald-600 to-teal-600',
        purple: 'from-purple-600 to-indigo-600',
        orange: 'from-orange-500 to-amber-500',
        red: 'from-red-600 to-rose-600',
    };

    return (
        <div className={`
            relative overflow-hidden rounded-2xl p-6
            ${gradient
                ? `bg-gradient-to-br ${gradientClasses[gradient]} text-white`
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }
            shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl
        `}>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-sm font-medium ${gradient ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {title}
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${gradient ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {value}
                    </p>
                    {trend && (
                        <div className={`flex items-center mt-2 text-sm ${gradient
                                ? 'text-white/90'
                                : trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                            <span className="mr-1">{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className={`ml-1 ${gradient ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                                vs last month
                            </span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl ${gradient ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                        {icon}
                    </div>
                )}
            </div>
            {/* Decorative circles */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${gradient ? 'bg-white/10' : 'bg-blue-500/5'}`} />
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${gradient ? 'bg-white/5' : 'bg-blue-500/5'}`} />
        </div>
    );
}
