'use client';

import { useEffect, useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { applicationsApi } from '@/lib/api';
import type { Application } from '@/types';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const res = await applicationsApi.getAll();
            setApplications(res.data.applications || []);
        } catch (error) {
            console.error('Failed to load applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const stageColors: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
        pending: 'default',
        in_progress: 'warning',
        completed: 'success',
    };

    if (loading) {
        return <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
                <p className="text-gray-600 mt-1">Track your application progress</p>
            </div>

            {applications.length > 0 ? (
                <div className="space-y-6">
                    {applications.map((app) => (
                        <Card key={app.id}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{app.country}</h3>
                                    <p className="text-gray-500">{app.university || 'University pending'}</p>
                                    {app.course && <p className="text-sm text-gray-500">{app.course}</p>}
                                </div>
                                <Badge variant="info">{app.status?.replace('_', ' ')}</Badge>
                            </div>

                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                                <div className="space-y-6">
                                    {app.stages?.map((stage) => (
                                        <div key={stage.id} className="relative flex items-start gap-4 pl-10">
                                            <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${stage.status === 'completed'
                                                ? 'bg-green-500 border-green-500'
                                                : stage.status === 'in_progress'
                                                    ? 'bg-yellow-500 border-yellow-500'
                                                    : 'bg-white border-gray-300'
                                                }`} />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className={`font-medium ${stage.status === 'completed' ? 'text-gray-900' : 'text-gray-500'}`}>
                                                        {stage.stage_name}
                                                    </p>
                                                    <Badge variant={stageColors[stage.status]}>{stage.status?.replace('_', ' ')}</Badge>
                                                </div>
                                                {stage.completed_at && (
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Completed: {new Date(stage.completed_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                                {stage.notes && (
                                                    <p className="text-sm text-gray-600 mt-1">{stage.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <p className="text-gray-500 text-center py-8">
                        No applications yet. Contact your counselor to start your application!
                    </p>
                </Card>
            )}
        </div>
    );
}
