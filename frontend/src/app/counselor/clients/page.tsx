'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Badge, ChartCard, DonutChart, MetricCard } from '@/components/ui';
import { usersApi, applicationsApi } from '@/lib/api';
import type { User, Application } from '@/types';
import Link from 'next/link';

export default function CounselorClientsPage() {
    const [clients, setClients] = useState<User[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const loadData = useCallback(async () => {
        try {
            const [clientsRes, appsRes] = await Promise.all([
                usersApi.getClients(),
                applicationsApi.getAll(),
            ]);
            setClients(clientsRes.data.clients || []);
            setApplications(appsRes.data.applications || []);
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getClientApplications = (clientId: number) => {
        return applications.filter(app => app.client_id === clientId);
    };

    const filteredClients = clients.filter(client => {
        const fullName = `${client.profile?.first_name || ''} ${client.profile?.last_name || ''}`.toLowerCase();
        const email = client.email.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    // Stats
    const stats = {
        total: clients.length,
        withApplications: clients.filter(c => getClientApplications(c.id).length > 0).length,
        activeApplications: applications.filter(a =>
            !['visa_approved', 'visa_rejected'].includes(a.status)
        ).length,
    };

    // Application status distribution
    const statusDistribution = [
        { name: 'In Progress', value: applications.filter(a => !['visa_approved', 'visa_rejected'].includes(a.status)).length, color: '#3b82f6' },
        { name: 'Approved', value: applications.filter(a => a.status === 'visa_approved').length, color: '#10b981' },
        { name: 'Rejected', value: applications.filter(a => a.status === 'visa_rejected').length, color: '#ef4444' },
    ].filter(item => item.value > 0);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <UsersIcon className="w-8 h-8" />
                        <h1 className="text-2xl md:text-3xl font-bold">My Clients</h1>
                    </div>
                    <p className="text-white/80 max-w-lg">
                        Manage your assigned clients and track their application progress.
                    </p>
                    <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                            <span className="text-lg">👥</span>
                            <span className="text-sm">{stats.total} Total Clients</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                            <span className="text-lg">📋</span>
                            <span className="text-sm">{stats.activeApplications} Active Applications</span>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Stats and Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-3 gap-4">
                    <MetricCard
                        title="Total Clients"
                        value={stats.total}
                        color="purple"
                        icon={<UsersIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                    />
                    <MetricCard
                        title="With Applications"
                        value={stats.withApplications}
                        color="blue"
                        icon={<FolderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    />
                    <MetricCard
                        title="Active Cases"
                        value={stats.activeApplications}
                        color="green"
                        icon={<ClockIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                    />
                </div>
                <ChartCard title="Application Status" className="lg:col-span-1">
                    {statusDistribution.length > 0 ? (
                        <DonutChart data={statusDistribution} height={150} innerRadius={40} showLegend={false} />
                    ) : (
                        <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
                            No applications yet
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search clients by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                    >
                        <GridIcon className={`w-5 h-5 ${viewMode === 'grid' ? 'text-purple-600' : 'text-slate-400'}`} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                    >
                        <ListIcon className={`w-5 h-5 ${viewMode === 'list' ? 'text-purple-600' : 'text-slate-400'}`} />
                    </button>
                </div>
            </div>

            {/* Clients Grid/List */}
            {filteredClients.length > 0 ? (
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-3'
                }>
                    {filteredClients.map((client, idx) => {
                        const clientApps = getClientApplications(client.id);
                        const approvedCount = clientApps.filter(a => a.status === 'visa_approved').length;

                        if (viewMode === 'list') {
                            return (
                                <Card key={client.id} className="hover:shadow-lg hover:border-purple-500/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${['from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500'][idx % 4]
                                            } flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                            {(client.profile?.first_name?.[0] || client.email[0]).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {client.profile?.first_name} {client.profile?.last_name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{client.email}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">{clientApps.length}</p>
                                                <p className="text-xs text-slate-500">Apps</p>
                                            </div>
                                            {approvedCount > 0 && (
                                                <Badge variant="success">{approvedCount} Approved</Badge>
                                            )}
                                            <Link href={`/counselor/applications?client=${client.id}`}>
                                                <Button size="sm" variant="secondary">View</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            );
                        }

                        return (
                            <Card key={client.id} className="group hover:shadow-lg hover:border-purple-500/50 transition-all duration-200">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${['from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500'][idx % 4]
                                        } flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform`}>
                                        {(client.profile?.first_name?.[0] || client.email[0]).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                            {client.profile?.first_name} {client.profile?.last_name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{client.email}</p>
                                        {client.phone && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{client.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">{clientApps.length}</p>
                                                <p className="text-xs text-slate-500">Applications</p>
                                            </div>
                                            {approvedCount > 0 && (
                                                <Badge variant="success" className="ml-2">{approvedCount} ✓</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/counselor/applications?client=${client.id}`} className="flex-1">
                                            <Button size="sm" variant="secondary" className="w-full">
                                                Applications
                                            </Button>
                                        </Link>
                                        <Link href={`/counselor/messages?user=${client.id}`} className="flex-1">
                                            <Button size="sm" variant="secondary" className="w-full">
                                                Message
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-3xl">👥</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-1">
                            {searchTerm ? 'No clients found' : 'No clients assigned yet'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {searchTerm ? 'Try a different search term' : 'Clients will appear here when assigned to you'}
                        </p>
                    </div>
                </Card>
            )}
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

function SearchIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

function ClockIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function GridIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    );
}

function ListIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}
