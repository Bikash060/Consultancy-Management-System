'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, StatCard, ChartCard, DonutChart, BarChart, MetricCard, Badge } from '@/components/ui';
import { adminApi } from '@/lib/api';

interface CounselorPerformance {
    counselor: {
        id: number;
        email: string;
        profile?: { first_name?: string; last_name?: string };
    };
    total_applications: number;
    visa_approved: number;
    success_rate: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total_clients: 0,
        total_counselors: 0,
        total_applications: 0,
        visa_approved: 0,
        visa_rejected: 0,
        visa_success_rate: 0,
    });
    const [countryStats, setCountryStats] = useState<{ country: string; count: number }[]>([]);
    const [counselorPerformance, setCounselorPerformance] = useState<CounselorPerformance[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [dashRes, countryRes, perfRes] = await Promise.all([
                adminApi.getDashboard(),
                adminApi.getCountryStats(),
                adminApi.getReports(),
            ]);
            setStats(dashRes.data.stats || {});
            setCountryStats(countryRes.data.stats || []);
            setCounselorPerformance(perfRes.data.report || []);
        } catch (error) {
            console.error('Failed to load admin dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Prepare chart data
    const visaChartData = [
        { name: 'Approved', value: stats.visa_approved, color: '#10b981' },
        { name: 'Rejected', value: stats.visa_rejected, color: '#ef4444' },
        { name: 'In Progress', value: Math.max(0, stats.total_applications - stats.visa_approved - stats.visa_rejected), color: '#f59e0b' },
    ].filter(item => item.value > 0);

    const countryChartData = countryStats
        .slice(0, 6)
        .map(cs => ({ name: cs.country, applications: cs.count }));

    // Mock monthly trend data
    const monthlyTrendData = [
        { name: 'Jan', applications: 12, approved: 8 },
        { name: 'Feb', applications: 19, approved: 14 },
        { name: 'Mar', applications: 15, approved: 11 },
        { name: 'Apr', applications: 22, approved: 18 },
        { name: 'May', applications: 28, approved: 22 },
        { name: 'Jun', applications: stats.total_applications > 0 ? Math.round(stats.total_applications * 0.15) : 25, approved: stats.visa_approved > 0 ? Math.round(stats.visa_approved * 0.2) : 20 },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                    <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">👋</span>
                        <p className="text-white/80 font-medium">Admin Dashboard</p>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">System Overview</h1>
                    <p className="text-white/70 max-w-lg">
                        Monitor your consultancy performance, track visa applications, and manage your team.
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute left-1/2 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
                <div className="absolute right-1/4 bottom-1/4 w-20 h-20 bg-white/5 rounded-full" />
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard
                    title="Total Clients"
                    value={stats.total_clients}
                    color="blue"
                    icon={<UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    sparklineData={[5, 8, 12, 15, 18, stats.total_clients]}
                />
                <MetricCard
                    title="Counselors"
                    value={stats.total_counselors}
                    color="purple"
                    icon={<BriefcaseIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                />
                <MetricCard
                    title="Applications"
                    value={stats.total_applications}
                    color="orange"
                    icon={<FolderIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                    sparklineData={[3, 7, 12, 18, 22, stats.total_applications]}
                />
                <MetricCard
                    title="Visa Approved"
                    value={stats.visa_approved}
                    color="green"
                    icon={<CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                    change={{ value: 12, isPositive: true }}
                />
                <MetricCard
                    title="Visa Rejected"
                    value={stats.visa_rejected}
                    color="red"
                    icon={<XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />}
                />
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg">
                    <p className="text-sm text-white/80 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold">{stats.visa_success_rate}%</p>
                    <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${stats.visa_success_rate}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visa Status Pie Chart */}
                <ChartCard
                    title="Visa Status Distribution"
                    subtitle="Overview of all visa application outcomes"
                >
                    {visaChartData.length > 0 ? (
                        <DonutChart data={visaChartData} height={280} innerRadius={70} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400">
                            <p>No visa data available</p>
                        </div>
                    )}
                </ChartCard>

                {/* Country Stats Bar Chart */}
                <ChartCard
                    title="Applications by Country"
                    subtitle="Top destination countries"
                >
                    {countryChartData.length > 0 ? (
                        <BarChart
                            data={countryChartData}
                            dataKeys={[{ key: 'applications', color: '#8b5cf6', name: 'Applications' }]}
                            height={280}
                            layout="vertical"
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400">
                            <p>No country data available</p>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Monthly Trends */}
            <ChartCard
                title="Monthly Application Trends"
                subtitle="Applications submitted and approved over time"
            >
                <BarChart
                    data={monthlyTrendData}
                    dataKeys={[
                        { key: 'applications', color: '#3b82f6', name: 'Submitted' },
                        { key: 'approved', color: '#10b981', name: 'Approved' },
                    ]}
                    height={300}
                    layout="horizontal"
                />
            </ChartCard>

            {/* Counselor Performance */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Counselor Performance</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Individual counselor statistics and success rates</p>
                    </div>
                </div>
                {counselorPerformance.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Counselor</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Applications</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Approved</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Success Rate</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {counselorPerformance.map((cp) => (
                                    <tr key={cp.counselor.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                                                    {(cp.counselor.profile?.first_name?.[0] || cp.counselor.email[0]).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {cp.counselor.profile?.first_name} {cp.counselor.profile?.last_name}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{cp.counselor.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-slate-900 dark:text-white font-medium">{cp.total_applications}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{cp.visa_approved}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge variant={cp.success_rate >= 70 ? 'success' : cp.success_rate >= 50 ? 'warning' : 'error'}>
                                                {cp.success_rate}%
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4 w-40">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${cp.success_rate >= 70 ? 'bg-emerald-500' : cp.success_rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${cp.success_rate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-3xl">👥</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">No counselor data available</p>
                    </div>
                )}
            </Card>
        </div>
    );
}

// Icons
function UsersIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function BriefcaseIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

function FolderIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    );
}

function CheckCircleIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function XCircleIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
