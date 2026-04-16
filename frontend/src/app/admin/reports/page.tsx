'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, ChartCard, DonutChart, BarChart, AreaChart, MetricCard, Badge } from '@/components/ui';
import { adminApi } from '@/lib/api';

interface CounselorReport {
    counselor: {
        id: number;
        email: string;
        profile?: { first_name?: string; last_name?: string };
    };
    total_applications: number;
    visa_approved: number;
    success_rate: number;
}

interface CountryStat { country: string; count: number; }
interface UniversityStat { university: string; country: string; total: number; approved: number; }

function getFlag(code: string) {
    if (!code || code.length !== 2) return '';
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + 127397));
}

export default function ReportsPage() {
    const [counselorReports, setCounselorReports] = useState<CounselorReport[]>([]);
    const [countryStats, setCountryStats] = useState<CountryStat[]>([]);
    const [universityStats, setUniversityStats] = useState<UniversityStat[]>([]);
    const [monthlyTrends, setMonthlyTrends] = useState<{ name: string; applications: number; approved: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [counselorRes, countryRes, trendsRes, uniRes] = await Promise.all([
                adminApi.getReports(),
                adminApi.getCountryStats(),
                adminApi.getMonthlyTrends(),
                adminApi.getUniversityStats(),
            ]);
            setCounselorReports(counselorRes.data.report || []);
            setCountryStats(countryRes.data.stats || []);
            setMonthlyTrends(trendsRes.data.trends || []);
            setUniversityStats(uniRes.data.stats || []);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (<div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                    <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                </div>
            </div>
        );
    }

    const totalApplications = counselorReports.reduce((sum, r) => sum + r.total_applications, 0);
    const totalApproved = counselorReports.reduce((sum, r) => sum + r.visa_approved, 0);
    const avgSuccessRate = counselorReports.length > 0
        ? counselorReports.reduce((sum, r) => sum + r.success_rate, 0) / counselorReports.length : 0;

    const countryChartData = countryStats.slice(0, 8).map(cs => ({ name: cs.country, applications: cs.count }));
    const counselorChartData = counselorReports.map(r => ({
        name: r.counselor.profile?.first_name || r.counselor.email.split('@')[0],
        total: r.total_applications, approved: r.visa_approved,
    }));
    const universityChartData = universityStats.slice(0, 8).map(u => ({
        name: u.university.length > 20 ? u.university.substring(0, 18) + '...' : u.university,
        total: u.total, approved: u.approved,
    }));
    const performanceDistribution = [
        { name: 'Excellent (80%+)', value: counselorReports.filter(r => r.success_rate >= 80).length, color: '#10b981' },
        { name: 'Good (60-79%)', value: counselorReports.filter(r => r.success_rate >= 60 && r.success_rate < 80).length, color: '#3b82f6' },
        { name: 'Average (40-59%)', value: counselorReports.filter(r => r.success_rate >= 40 && r.success_rate < 60).length, color: '#f59e0b' },
        { name: 'Below Avg (<40%)', value: counselorReports.filter(r => r.success_rate < 40).length, color: '#ef4444' },
    ].filter(item => item.value > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <h1 className="text-2xl md:text-3xl font-bold">Reports & Analytics</h1>
                    </div>
                    <p className="text-white/80 max-w-lg">Comprehensive performance insights, trends, and statistics.</p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard title="Total Applications" value={totalApplications} color="blue" icon={<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>} sparklineData={[8, 12, 18, 22, 28, totalApplications]} />
                <MetricCard title="Visas Approved" value={totalApproved} color="green" icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <MetricCard title="Avg Success Rate" value={`${avgSuccessRate.toFixed(1)}%`} color="purple" icon={<svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Applications by Country" subtitle="Geographic distribution of visa applications">
                    {countryChartData.length > 0 ? (
                        <BarChart data={countryChartData} dataKeys={[{ key: 'applications', color: '#8b5cf6', name: 'Applications' }]} height={300} layout="horizontal" />
                    ) : <EmptyState message="No country data available" />}
                </ChartCard>
                <ChartCard title="Counselor Performance Distribution" subtitle="Success rate categories across team">
                    {performanceDistribution.length > 0 ? (
                        <DonutChart data={performanceDistribution} height={300} innerRadius={70} />
                    ) : <EmptyState message="No performance data" />}
                </ChartCard>
            </div>

            {/* University Stats Chart */}
            {universityChartData.length > 0 && (
                <ChartCard title="Applications by University" subtitle="Top universities by application volume">
                    <BarChart data={universityChartData} dataKeys={[
                        { key: 'total', color: '#6366f1', name: 'Total Applications' },
                        { key: 'approved', color: '#10b981', name: 'Approved' },
                    ]} height={300} layout="horizontal" />
                </ChartCard>
            )}

            {/* University Detail Table */}
            {universityStats.length > 0 && (
                <Card>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">University Performance Details</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Applications and approval rates by university</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">University</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Country</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Total</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Approved</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {universityStats.map((u, idx) => {
                                    const rate = u.total > 0 ? Math.round((u.approved / u.total) * 100) : 0;
                                    return (
                                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{u.university}</td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.country}</td>
                                            <td className="py-3 px-4 text-center font-medium text-slate-900 dark:text-white">{u.total}</td>
                                            <td className="py-3 px-4 text-center font-medium text-emerald-600 dark:text-emerald-400">{u.approved}</td>
                                            <td className="py-3 px-4 w-40">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${rate >= 70 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-10">{rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Monthly Trends */}
            <ChartCard title="Monthly Application Trends" subtitle="Applications submitted and approved over the last 6 months">
                {monthlyTrends.length > 0 ? (
                    <AreaChart data={monthlyTrends} dataKeys={[
                        { key: 'applications', color: '#3b82f6', name: 'Submitted' },
                        { key: 'approved', color: '#10b981', name: 'Approved' },
                    ]} height={280} />
                ) : <EmptyState message="No trend data available" />}
            </ChartCard>

            {/* Counselor Comparison */}
            {counselorChartData.length > 0 && (
                <ChartCard title="Counselor Comparison" subtitle="Applications handled vs approved by counselor">
                    <BarChart data={counselorChartData} dataKeys={[
                        { key: 'total', color: '#64748b', name: 'Total Applications' },
                        { key: 'approved', color: '#10b981', name: 'Approved' },
                    ]} height={300} layout="horizontal" />
                </ChartCard>
            )}

            {/* Counselor Performance Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Detailed Counselor Performance</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Individual metrics and success rates</p>
                    </div>
                </div>
                {counselorReports.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Counselor</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Total</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Approved</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Success Rate</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {counselorReports.map((report, idx) => (
                                    <tr key={report.counselor.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500'][idx % 4]} flex items-center justify-center text-white font-bold text-sm`}>
                                                    {report.counselor.profile?.first_name?.[0] || report.counselor.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{report.counselor.profile?.first_name} {report.counselor.profile?.last_name}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{report.counselor.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center"><span className="text-slate-900 dark:text-white font-medium">{report.total_applications}</span></td>
                                        <td className="py-4 px-4 text-center"><span className="text-emerald-600 dark:text-emerald-400 font-medium">{report.visa_approved}</span></td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${report.success_rate >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : report.success_rate >= 50 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                {report.success_rate}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 w-48">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${report.success_rate >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : report.success_rate >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`} style={{ width: `${report.success_rate}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <EmptyState message="No counselor data available" />}
            </Card>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <p>{message}</p>
        </div>
    );
}
