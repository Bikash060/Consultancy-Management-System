'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { applicationsApi, usersApi } from '@/lib/api';
import type { Application, User } from '@/types';

const APPLICATION_STAGES = [
    { value: 'document_collection', label: 'Document Collection', icon: '📁' },
    { value: 'application_submitted', label: 'Application Submitted', icon: '📤' },
    { value: 'offer_received', label: 'Offer Received', icon: '📩' },
    { value: 'visa_lodged', label: 'Visa Lodged', icon: '📋' },
    { value: 'visa_approved', label: 'Visa Approved', icon: '✅' },
    { value: 'visa_rejected', label: 'Visa Rejected', icon: '❌' },
];

export default function CounselorApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [appsRes, clientsRes] = await Promise.all([
                applicationsApi.getAll(),
                usersApi.getClients(),
            ]);
            setApplications(appsRes.data.applications || []);
            setClients(clientsRes.data.clients || []);
        } catch (error) {
            console.error('Failed to load applications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateStage = async (id: number, status: string) => {
        try {
            await applicationsApi.update(id, { status });
            loadData();
            setSelectedApp(null);
        } catch (error) {
            console.error('Failed to update application:', error);
        }
    };

    const getClientName = (clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        return client ? `${client.profile?.first_name || ''} ${client.profile?.last_name || ''}`.trim() || client.email : 'Unknown';
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const statusColors: Record<string, 'info' | 'warning' | 'success' | 'error' | 'default'> = {
        document_collection: 'info',
        application_submitted: 'warning',
        offer_received: 'success',
        visa_lodged: 'warning',
        visa_approved: 'success',
        visa_rejected: 'error',
    };

    const stats = {
        total: applications.length,
        inProgress: applications.filter(a => ['document_collection', 'application_submitted', 'offer_received', 'visa_lodged'].includes(a.status)).length,
        approved: applications.filter(a => a.status === 'visa_approved').length,
        rejected: applications.filter(a => a.status === 'visa_rejected').length,
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded skeleton" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                    ))}
                </div>
                <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <FolderIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Applications</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Track and update client application stages</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total" value={stats.total} color="blue" />
                <StatsCard label="In Progress" value={stats.inProgress} color="yellow" />
                <StatsCard label="Approved" value={stats.approved} color="green" />
                <StatsCard label="Rejected" value={stats.rejected} color="red" />
            </div>

            {/* Filter & List */}
            <Card>
                <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mr-2">Stage:</span>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        All
                    </button>
                    {APPLICATION_STAGES.map((stage) => (
                        <button
                            key={stage.value}
                            onClick={() => setFilter(stage.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === stage.value
                                ? 'bg-orange-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            {stage.icon} {stage.label.split(' ')[0]}
                        </button>
                    ))}
                </div>

                {filteredApplications.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredApplications.map((app) => {
                            const currentStageIndex = APPLICATION_STAGES.findIndex(s => s.value === app.status);
                            return (
                                <div key={app.id} className="py-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                                                <span className="text-xl">🌍</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {app.country} - {app.university || 'University pending'}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Client: {getClientName(app.client_id)}
                                                    {app.course && ` • ${app.course}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-16 md:ml-0">
                                            <Badge variant={statusColors[app.status]}>
                                                {app.status.replace(/_/g, ' ')}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedApp(app)}
                                            >
                                                Update Stage
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="ml-16 flex items-center gap-1">
                                        {APPLICATION_STAGES.slice(0, -1).map((stage, idx) => (
                                            <div key={stage.value} className="flex-1 flex items-center">
                                                <div
                                                    className={`h-2 flex-1 rounded-full ${idx <= currentStageIndex
                                                        ? app.status === 'visa_rejected'
                                                            ? 'bg-red-500'
                                                            : 'bg-gradient-to-r from-orange-500 to-amber-500'
                                                        : 'bg-slate-200 dark:bg-slate-700'
                                                        }`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-3xl">📋</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-1">No applications found</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {filter !== 'all' ? 'Try changing the filter' : 'Applications will appear here when clients submit them'}
                        </p>
                    </div>
                )}
            </Card>

            {/* Update Stage Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Update Application Stage</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            {selectedApp.country} - {getClientName(selectedApp.client_id)}
                        </p>
                        <div className="space-y-2 mb-6">
                            {APPLICATION_STAGES.map((stage) => (
                                <button
                                    key={stage.value}
                                    onClick={() => handleUpdateStage(selectedApp.id, stage.value)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedApp.status === stage.value
                                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-400'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10'
                                        }`}
                                >
                                    <span className="text-xl">{stage.icon}</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{stage.label}</span>
                                    {selectedApp.status === stage.value && (
                                        <Badge variant="warning" className="ml-auto">Current</Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                        <Button variant="secondary" onClick={() => setSelectedApp(null)} className="w-full">
                            Cancel
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}

function StatsCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colors: Record<string, string> = {
        blue: 'from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400',
        yellow: 'from-yellow-500/20 to-amber-500/20 text-yellow-600 dark:text-yellow-400',
        green: 'from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400',
        red: 'from-red-500/20 to-rose-500/20 text-red-600 dark:text-red-400',
    };

    return (
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color]} border border-slate-200 dark:border-slate-700`}>
            <p className="text-sm font-medium opacity-70">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function FolderIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    );
}
