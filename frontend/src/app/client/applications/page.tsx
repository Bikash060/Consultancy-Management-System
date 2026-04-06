'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { applicationsApi, adminApi } from '@/lib/api';
import type { Application } from '@/types';
import Link from 'next/link';

interface CountryOption {
    id: number;
    name: string;
    code: string;
    universities: { id: number; name: string }[];
}

function getFlag(code: string) {
    if (!code || code.length !== 2) return '';
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + 127397));
}

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [countries, setCountries] = useState<CountryOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [appRes, countriesRes] = await Promise.all([
                applicationsApi.getAll(),
                adminApi.getPublicCountries(),
            ]);
            setApplications(appRes.data.applications || []);
            setCountries(countriesRes.data.countries || []);
        } catch (error) { console.error('Failed to load data:', error); }
        finally { setLoading(false); }
    };

    const statusColors: Record<string, 'info' | 'warning' | 'success' | 'error' | 'default'> = {
        pending: 'warning', document_collection: 'info', application_submitted: 'warning',
        offer_received: 'success', visa_lodged: 'warning', visa_approved: 'success',
        visa_rejected: 'error', completed: 'success',
    };

    // Map application overall status → how many stages are "done" (0-based index up to which are complete)
    const STATUS_STAGE_MAP: Record<string, number> = {
        pending: -1,
        document_collection: 0,       // stage 0 in progress
        application_submitted: 1,      // stage 1 in progress
        offer_received: 2,             // stage 2 in progress
        visa_lodged: 3,                // stage 3 in progress
        visa_approved: 5,              // all done
        visa_rejected: 5,              // all done (rejected)
        rejected: -1,
    };

    const getDerivedStageStatus = (appStatus: string, stageIndex: number): 'completed' | 'in_progress' | 'pending' => {
        const progressIndex = STATUS_STAGE_MAP[appStatus] ?? -1;
        if (progressIndex === 5) return 'completed';
        if (stageIndex < progressIndex) return 'completed';
        if (stageIndex === progressIndex) return 'in_progress';
        return 'pending';
    };

    const getFlagForName = (name: string) => {
        const c = countries.find(ct => ct.name === name);
        return c ? getFlag(c.code) : '';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <h1 className="text-2xl md:text-3xl font-bold">My Applications</h1>
                        </div>
                        <p className="text-white/80">Track your study abroad application progress</p>
                    </div>
                    <Link href="/client/applications/new">
                        <Button className="bg-white text-indigo-600 hover:bg-white/90"><span className="mr-2">+</span> New Application</Button>
                    </Link>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Applications List */}
            {applications.length > 0 ? (
                <div className="space-y-6">
                    {applications.map((app) => (
                        <Card key={app.id} className="overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{getFlagForName(app.country) || '\ud83c\udf0d'}</span>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{app.country}</h3>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400">{app.university || 'University TBD'}</p>
                                    {app.course && <p className="text-sm text-slate-400">{app.course}</p>}
                                    {app.intake && <p className="text-xs text-blue-500 mt-1">Intake: {app.intake}</p>}
                                </div>
                                <Badge variant={statusColors[app.status] ?? 'default'}>{app.status?.replace(/_/g, ' ')}</Badge>
                            </div>

                            {/* Stages Timeline */}
                            {app.stages && app.stages.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Progress</p>
                                    {/* Horizontal step bar */}
                                    <div className="flex items-center gap-0 mb-6">
                                        {app.stages.map((stage, idx) => {
                                            const derived = getDerivedStageStatus(app.status, idx);
                                            const isLast = idx === app.stages.length - 1;
                                            return (
                                                <div key={stage.id} className="flex items-center flex-1 min-w-0">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                                            derived === 'completed'
                                                                ? app.status === 'visa_rejected' && idx === app.stages.length - 1
                                                                    ? 'bg-red-500 border-red-500 text-white'
                                                                    : 'bg-emerald-500 border-emerald-500 text-white'
                                                                : derived === 'in_progress'
                                                                ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                                                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                                                        }`}>
                                                            {derived === 'completed'
                                                                ? (app.status === 'visa_rejected' && idx === app.stages.length - 1 ? '✕' : '✓')
                                                                : idx + 1}
                                                        </div>
                                                        <p className={`text-xs mt-1.5 text-center leading-tight max-w-[70px] ${
                                                            derived === 'completed' ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                                            : derived === 'in_progress' ? 'text-blue-600 dark:text-blue-400 font-medium'
                                                            : 'text-slate-400'
                                                        }`}>{stage.stage_name}</p>
                                                    </div>
                                                    {!isLast && (
                                                        <div className={`flex-1 h-0.5 mx-1 transition-all ${
                                                            getDerivedStageStatus(app.status, idx) === 'completed'
                                                                ? app.status === 'visa_rejected' ? 'bg-red-300 dark:bg-red-700' : 'bg-emerald-400 dark:bg-emerald-600'
                                                                : 'bg-slate-200 dark:bg-slate-700'
                                                        }`} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Current status label */}
                                    <div className={`text-xs font-medium px-3 py-1.5 rounded-lg inline-block ${
                                        app.status === 'visa_approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : app.status === 'visa_rejected' || app.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        : app.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    }`}>
                                        {app.status === 'pending' ? 'Awaiting counselor review' : `Current stage: ${app.status.replace(/_/g, ' ')}`}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-semibold text-lg">No applications yet</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm mx-auto">Create your first application and track every stage of your study abroad journey.</p>
                        </div>
                        <Link href="/client/applications/new">
                            <Button>+ New Application</Button>
                        </Link>
                    </div>
                </Card>
            )}
        </div>
    );
}
