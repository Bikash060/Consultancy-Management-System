'use client';

import { useEffect, useState } from 'react';
import { Card, StatCard, Badge, ChartCard, DonutChart, ProgressRing } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { appointmentsApi, applicationsApi, documentsApi } from '@/lib/api';
import Link from 'next/link';

const APPLICATION_STAGES = [
    { value: 'document_collection', label: 'Document Collection', icon: '📁', step: 1 },
    { value: 'application_submitted', label: 'Application Submitted', icon: '📤', step: 2 },
    { value: 'offer_received', label: 'Offer Received', icon: '📩', step: 3 },
    { value: 'visa_lodged', label: 'Visa Lodged', icon: '📋', step: 4 },
    { value: 'visa_approved', label: 'Visa Approved', icon: '✅', step: 5 },
    { value: 'visa_rejected', label: 'Visa Rejected', icon: '❌', step: -1 },
];

interface Application {
    id: number;
    country: string;
    status: string;
    university?: string;
    course?: string;
}

interface Document {
    id: number;
    type: string;
    status: string;
    filename?: string;
}

interface Appointment {
    id: number;
    scheduled_at: string;
    status: string;
}

export default function ClientDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        appointments: 0,
        applications: 0,
        documents: 0,
        pendingDocs: 0,
        verifiedDocs: 0,
    });
    const [recentApplications, setRecentApplications] = useState<Application[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                const [apptRes, appRes, docRes] = await Promise.all([
                    appointmentsApi.getAll(),
                    applicationsApi.getAll(),
                    documentsApi.getAll(),
                ]);

                const docs: Document[] = docRes.data.documents || [];
                const appointments: Appointment[] = apptRes.data.appointments || [];

                // Filter upcoming appointments
                const now = new Date();
                const upcoming = appointments
                    .filter(a => new Date(a.scheduled_at) > now && a.status !== 'cancelled')
                    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                    .slice(0, 3);

                setStats({
                    appointments: appointments.length,
                    applications: appRes.data.applications?.length || 0,
                    documents: docs.length,
                    pendingDocs: docs.filter((d) => d.status === 'pending').length,
                    verifiedDocs: docs.filter((d) => d.status === 'verified').length,
                });

                setRecentApplications(appRes.data.applications?.slice(0, 3) || []);
                setDocuments(docs);
                setUpcomingAppointments(upcoming);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const statusColors: Record<string, 'info' | 'warning' | 'success' | 'error' | 'default'> = {
        document_collection: 'info',
        application_submitted: 'warning',
        offer_received: 'success',
        visa_lodged: 'warning',
        visa_approved: 'success',
        visa_rejected: 'error',
    };

    const quickActions = [
        { name: 'Book Appointment', href: '/client/appointments', icon: '📅', color: 'from-blue-500 to-cyan-500', description: 'Schedule a meeting' },
        { name: 'Upload Document', href: '/client/documents', icon: '📄', color: 'from-purple-500 to-pink-500', description: 'Submit your files' },
        { name: 'Ask AI Assistant', href: '/client/chat', icon: '✨', color: 'from-amber-500 to-orange-500', description: 'Get instant help' },
        { name: 'Send Message', href: '/client/messages', icon: '💬', color: 'from-emerald-500 to-teal-500', description: 'Contact counselor' },
    ];

    // Document status chart data
    const documentChartData = [
        { name: 'Verified', value: stats.verifiedDocs, color: '#10b981' },
        { name: 'Pending', value: stats.pendingDocs, color: '#f59e0b' },
        { name: 'Other', value: Math.max(0, stats.documents - stats.verifiedDocs - stats.pendingDocs), color: '#94a3b8' },
    ].filter(item => item.value > 0);

    // Get current application stage
    const getCurrentStage = (status: string) => {
        const stage = APPLICATION_STAGES.find(s => s.value === status);
        return stage?.step || 0;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <p className="text-blue-100 text-sm font-medium mb-1">Welcome back</p>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        {user?.profile?.first_name || 'Student'}! 🎓
                    </h1>
                    <p className="text-blue-100/80 max-w-lg">
                        Track your education journey and stay updated on your application progress.
                    </p>

                    {/* Quick Status */}
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                            <span className="text-lg">📋</span>
                            <span className="text-sm">{stats.applications} Applications</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                            <span className="text-lg">📄</span>
                            <span className="text-sm">{stats.verifiedDocs}/{stats.documents} Documents Verified</span>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute left-1/2 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Appointments"
                    value={stats.appointments}
                    gradient="blue"
                    icon={<CalendarIcon />}
                />
                <StatCard
                    title="Applications"
                    value={stats.applications}
                    gradient="green"
                    icon={<FolderIcon />}
                />
                <StatCard
                    title="Documents"
                    value={stats.documents}
                    gradient="purple"
                    icon={<DocumentIcon />}
                />
                <StatCard
                    title="Pending Review"
                    value={stats.pendingDocs}
                    gradient="orange"
                    icon={<ClockIcon />}
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            className="group relative overflow-hidden rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                            <div className="text-3xl mb-2">{action.icon}</div>
                            <p className="font-medium text-slate-900 dark:text-white">{action.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{action.description}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Charts and Progress Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Status */}
                <ChartCard
                    title="Document Status"
                    subtitle="Overview of your document verification"
                >
                    {documentChartData.length > 0 ? (
                        <DonutChart data={documentChartData} height={250} innerRadius={60} />
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                            <span className="text-4xl mb-2">📁</span>
                            <p>No documents uploaded yet</p>
                            <Link href="/client/documents" className="text-blue-500 hover:underline text-sm mt-1">
                                Upload your first document →
                            </Link>
                        </div>
                    )}
                </ChartCard>

                {/* Upcoming Appointments */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Appointments</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Your scheduled meetings</p>
                        </div>
                        <Link href="/client/appointments" className="text-sm text-blue-500 hover:underline">
                            View all
                        </Link>
                    </div>
                    {upcomingAppointments.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingAppointments.map((apt) => (
                                <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex flex-col items-center justify-center text-white">
                                        <span className="text-xs font-medium">{new Date(apt.scheduled_at).toLocaleDateString([], { month: 'short' })}</span>
                                        <span className="text-lg font-bold leading-none">{new Date(apt.scheduled_at).getDate()}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {new Date(apt.scheduled_at).toLocaleDateString([], { weekday: 'long' })}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <Badge variant={apt.status === 'accepted' ? 'success' : 'warning'}>
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
                            <p className="text-slate-600 dark:text-slate-300 mb-2">No upcoming appointments</p>
                            <Link href="/client/appointments" className="text-blue-500 hover:underline text-sm">
                                Book an appointment →
                            </Link>
                        </div>
                    )}
                </Card>
            </div>

            {/* Application Progress */}
            {recentApplications.length > 0 && (
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Application Progress</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Track your visa application journey</p>
                        </div>
                        <Link href="/client/applications" className="text-sm text-blue-500 hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-6">
                        {recentApplications.map((app) => {
                            const currentStep = getCurrentStage(app.status);
                            const isRejected = app.status === 'visa_rejected';

                            return (
                                <div key={app.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                                <span className="text-xl">🌍</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{app.country}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{app.university || 'University pending'}</p>
                                            </div>
                                        </div>
                                        <Badge variant={statusColors[app.status] || 'default'}>
                                            {app.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>

                                    {/* Progress Timeline */}
                                    <div className="relative mt-6">
                                        <div className="flex items-center justify-between relative">
                                            {APPLICATION_STAGES.slice(0, 5).map((stage, index) => {
                                                const isCompleted = currentStep > stage.step;
                                                const isCurrent = currentStep === stage.step;

                                                return (
                                                    <div key={stage.value} className="flex flex-col items-center flex-1">
                                                        <div className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 transition-all
                                                            ${isRejected && isCurrent
                                                                ? 'bg-red-500 text-white'
                                                                : isCompleted
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : isCurrent
                                                                        ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                                            }
                                                        `}>
                                                            {isCompleted ? '✓' : stage.step}
                                                        </div>
                                                        <p className={`text-xs mt-2 text-center ${isCurrent ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                                            {stage.label.split(' ')[0]}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Progress Line */}
                                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" style={{ marginLeft: '1rem', marginRight: '1rem' }}>
                                            <div
                                                className={`h-full transition-all duration-500 ${isRejected ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.max(0, ((currentStep - 1) / 4) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Empty State for Applications */}
            {recentApplications.length === 0 && (
                <Card title="Recent Applications" subtitle="Your latest visa applications">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-3xl">📋</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-2">No applications yet</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Talk to your counselor to get started!</p>
                    </div>
                </Card>
            )}
        </div>
    );
}

// Icons
function CalendarIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function FolderIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    );
}

function DocumentIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
