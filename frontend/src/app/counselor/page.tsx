'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Badge, ChartCard, DonutChart, BarChart, MetricCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { usersApi, appointmentsApi, applicationsApi } from '@/lib/api';

const APPLICATION_STAGES = [
    { value: 'document_collection', label: 'Document Collection', color: '#3b82f6' },
    { value: 'application_submitted', label: 'Application Submitted', color: '#8b5cf6' },
    { value: 'offer_received', label: 'Offer Received', color: '#f59e0b' },
    { value: 'visa_lodged', label: 'Visa Lodged', color: '#06b6d4' },
    { value: 'visa_approved', label: 'Visa Approved', color: '#10b981' },
    { value: 'visa_rejected', label: 'Visa Rejected', color: '#ef4444' },
];

interface Application {
    id: number;
    status: string;
    country: string;
    university?: string;
    client_id: number;
}

interface Appointment {
    id: number;
    scheduled_at: string;
    status: string;
    client_id: number;
}

interface Client {
    id: number;
    email: string;
    profile?: { first_name?: string; last_name?: string };
}

export default function CounselorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalClients: 0,
        pendingAppointments: 0,
        todayAppointments: 0,
        activeApplications: 0,
    });
    const [applications, setApplications] = useState<Application[]>([]);
    const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
    const [weeklyAppts, setWeeklyAppts] = useState<{ name: string; appointments: number }[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [clientsRes, apptsRes, appsRes] = await Promise.all([
                usersApi.getClients(),
                appointmentsApi.getAll(),
                applicationsApi.getAll(),
            ]);

            const today = new Date().toDateString();
            const appointments: Appointment[] = apptsRes.data.appointments || [];
            const apps: Application[] = appsRes.data.applications || [];
            const clientList: Client[] = clientsRes.data.clients || [];

            const todaysAppts = appointments.filter((a) => new Date(a.scheduled_at).toDateString() === today);

            // Calculate weekly appointments
            const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());

            const weeklyData = weekDays.map((day, index) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + index);
                const count = appointments.filter(a =>
                    new Date(a.scheduled_at).toDateString() === dayDate.toDateString()
                ).length;
                return { name: day, appointments: count };
            });

            setStats({
                totalClients: clientList.length,
                pendingAppointments: appointments.filter((a) => a.status === 'pending').length,
                todayAppointments: todaysAppts.length,
                activeApplications: apps.length,
            });

            setApplications(apps);
            setTodayAppts(todaysAppts.slice(0, 5));
            setWeeklyAppts(weeklyData);
            setClients(clientList);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Prepare application stage chart data
    const stageChartData = APPLICATION_STAGES.map(stage => ({
        name: stage.label.split(' ')[0],
        value: applications.filter(a => a.status === stage.value).length,
        color: stage.color,
    })).filter(item => item.value > 0);

    const getClientName = (clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        return client?.profile?.first_name || client?.email?.split('@')[0] || 'Client';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <p className="text-white/80 font-medium mb-1">Good day,</p>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        {user?.profile?.first_name || 'Counselor'}! 👋
                    </h1>
                    <p className="text-white/70 max-w-lg">
                        You have <span className="font-semibold text-white">{stats.todayAppointments}</span> appointments today and <span className="font-semibold text-white">{stats.pendingAppointments}</span> pending requests.
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Clients"
                    value={stats.totalClients}
                    color="blue"
                    icon={<UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    sparklineData={[2, 4, 6, 8, 10, stats.totalClients]}
                />
                <MetricCard
                    title="Pending Requests"
                    value={stats.pendingAppointments}
                    color="orange"
                    icon={<ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                />
                <MetricCard
                    title="Today's Sessions"
                    value={stats.todayAppointments}
                    color="green"
                    icon={<CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                />
                <MetricCard
                    title="Active Applications"
                    value={stats.activeApplications}
                    color="purple"
                    icon={<FolderIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                    sparklineData={[3, 5, 8, 12, 15, stats.activeApplications]}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Application Stages */}
                <ChartCard
                    title="Application Pipeline"
                    subtitle="Current applications by stage"
                >
                    {stageChartData.length > 0 ? (
                        <DonutChart data={stageChartData} height={280} innerRadius={65} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400">
                            <p>No applications yet</p>
                        </div>
                    )}
                </ChartCard>

                {/* Weekly Appointments */}
                <ChartCard
                    title="Weekly Schedule"
                    subtitle="Appointments this week"
                >
                    <BarChart
                        data={weeklyAppts}
                        dataKeys={[{ key: 'appointments', color: '#f59e0b', name: 'Appointments' }]}
                        height={280}
                        layout="horizontal"
                    />
                </ChartCard>
            </div>

            {/* Today's Appointments + Recent Clients */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Today&apos;s Schedule</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Your upcoming appointments</p>
                        </div>
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                            {stats.todayAppointments} sessions
                        </span>
                    </div>
                    {todayAppts.length > 0 ? (
                        <div className="space-y-3">
                            {todayAppts.map((apt, index) => (
                                <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                                        {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(':')[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">
                                            {getClientName(apt.client_id)}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <Badge variant={apt.status === 'accepted' ? 'success' : apt.status === 'pending' ? 'warning' : 'default'}>
                                        {apt.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <span className="text-3xl">📅</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">No appointments today</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Enjoy your free day!</p>
                        </div>
                    )}
                </Card>

                {/* Recent Clients */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Clients</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Your assigned clients</p>
                        </div>
                    </div>
                    {clients.length > 0 ? (
                        <div className="space-y-3">
                            {clients.slice(0, 5).map((client) => {
                                const clientApps = applications.filter(a => a.client_id === client.id);
                                return (
                                    <div key={client.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                                            {(client.profile?.first_name?.[0] || client.email[0]).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">
                                                {client.profile?.first_name} {client.profile?.last_name || ''}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{client.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{clientApps.length}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">apps</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <span className="text-3xl">👥</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">No clients assigned yet</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Application Pipeline Overview */}
            <Card>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Application Pipeline</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Visual overview of all applications</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {APPLICATION_STAGES.map((stage) => {
                        const count = applications.filter(a => a.status === stage.value).length;
                        return (
                            <div
                                key={stage.value}
                                className="relative p-4 rounded-xl border-2 transition-all hover:scale-105"
                                style={{ borderColor: stage.color }}
                            >
                                <div
                                    className="absolute inset-0 rounded-xl opacity-10"
                                    style={{ backgroundColor: stage.color }}
                                />
                                <p className="relative text-3xl font-bold text-slate-900 dark:text-white">{count}</p>
                                <p className="relative text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                                    {stage.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
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

function ClockIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function CalendarIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
