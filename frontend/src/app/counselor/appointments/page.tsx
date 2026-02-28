'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Badge, ChartCard, DonutChart, BarChart, MetricCard } from '@/components/ui';
import { appointmentsApi, usersApi } from '@/lib/api';
import type { Appointment, User } from '@/types';

export default function CounselorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    const loadData = useCallback(async () => {
        try {
            const [apptsRes, clientsRes] = await Promise.all([
                appointmentsApi.getAll(),
                usersApi.getClients(),
            ]);
            setAppointments(apptsRes.data.appointments || []);
            setClients(clientsRes.data.clients || []);
        } catch (error) {
            console.error('Failed to load appointments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await appointmentsApi.update(id, { status });
            loadData();
        } catch (error) {
            console.error('Failed to update appointment:', error);
        }
    };

    const getClientName = (clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        return client?.profile?.first_name
            ? `${client.profile.first_name} ${client.profile.last_name || ''}`
            : client?.email?.split('@')[0] || 'Client';
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'all') return true;
        return apt.status === filter;
    });

    const statusColors: Record<string, 'info' | 'warning' | 'success' | 'error' | 'default'> = {
        pending: 'warning',
        accepted: 'success',
        rejected: 'error',
        completed: 'info',
        cancelled: 'default',
    };

    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        accepted: appointments.filter(a => a.status === 'accepted').length,
        completed: appointments.filter(a => a.status === 'completed').length,
    };

    // Status distribution chart
    const statusDistribution = [
        { name: 'Pending', value: stats.pending, color: '#f59e0b' },
        { name: 'Accepted', value: stats.accepted, color: '#10b981' },
        { name: 'Completed', value: stats.completed, color: '#3b82f6' },
        { name: 'Rejected', value: appointments.filter(a => a.status === 'rejected').length, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Weekly distribution chart
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = weekDays.map(day => {
        const dayIndex = weekDays.indexOf(day);
        const count = appointments.filter(a => new Date(a.scheduled_at).getDay() === dayIndex).length;
        return { name: day, appointments: count };
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                    ))}
                </div>
                <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <CalendarIcon className="w-8 h-8" />
                        <h1 className="text-2xl md:text-3xl font-bold">Appointments</h1>
                    </div>
                    <p className="text-white/80 max-w-lg">
                        Manage client appointment requests and schedule your sessions.
                    </p>
                    <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                            <span className="text-lg">⏳</span>
                            <span className="text-sm">{stats.pending} Pending</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                            <span className="text-lg">✅</span>
                            <span className="text-sm">{stats.accepted} Accepted</span>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total"
                    value={stats.total}
                    color="blue"
                    icon={<CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                />
                <MetricCard
                    title="Pending"
                    value={stats.pending}
                    color="orange"
                    icon={<ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                />
                <MetricCard
                    title="Accepted"
                    value={stats.accepted}
                    color="green"
                    icon={<CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                />
                <MetricCard
                    title="Completed"
                    value={stats.completed}
                    color="purple"
                    icon={<StarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Status Distribution"
                    subtitle="Breakdown of appointment statuses"
                >
                    {statusDistribution.length > 0 ? (
                        <DonutChart data={statusDistribution} height={250} innerRadius={60} />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400">
                            No appointment data
                        </div>
                    )}
                </ChartCard>

                <ChartCard
                    title="Weekly Distribution"
                    subtitle="Appointments by day of week"
                >
                    <BarChart
                        data={weeklyData}
                        dataKeys={[{ key: 'appointments', color: '#06b6d4', name: 'Appointments' }]}
                        height={250}
                        layout="horizontal"
                    />
                </ChartCard>
            </div>

            {/* Filter & List */}
            <Card>
                <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filter:</span>
                    {['all', 'pending', 'accepted', 'completed', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {filteredAppointments.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredAppointments.map((apt) => (
                            <div key={apt.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex flex-col items-center justify-center text-white shadow-lg">
                                        <span className="text-xs font-medium">{new Date(apt.scheduled_at).toLocaleDateString([], { month: 'short' })}</span>
                                        <span className="text-lg font-bold leading-none">{new Date(apt.scheduled_at).getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {getClientName(apt.client_id)}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(apt.scheduled_at).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                            <span className="mx-1">•</span>
                                            {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {apt.notes && (
                                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 italic">{apt.notes}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 ml-18 md:ml-0">
                                    <Badge variant={statusColors[apt.status]}>{apt.status}</Badge>
                                    {apt.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusUpdate(apt.id, 'accepted')}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleStatusUpdate(apt.id, 'rejected')}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                    {apt.status === 'accepted' && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                        >
                                            Mark Complete
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-3xl">📅</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-1">No appointments found</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {filter !== 'all' ? 'Try changing the filter' : 'Appointments will appear here when clients book sessions'}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}

// Icons
function CalendarIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function ClockIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function CheckIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function StarIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    );
}
