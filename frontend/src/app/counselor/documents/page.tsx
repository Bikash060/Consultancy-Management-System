'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { documentsApi, usersApi } from '@/lib/api';
import type { Document, User } from '@/types';

export default function CounselorDocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [commentModal, setCommentModal] = useState<{ id: number; show: boolean; comment: string }>({ id: 0, show: false, comment: '' });

    const loadData = useCallback(async () => {
        try {
            const [docsRes, clientsRes] = await Promise.all([
                documentsApi.getAll(),
                usersApi.getClients(),
            ]);
            setDocuments(docsRes.data.documents || []);
            setClients(clientsRes.data.clients || []);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleVerify = async (id: number) => {
        try {
            await documentsApi.verify(id);
            loadData();
        } catch (error) {
            console.error('Failed to verify document:', error);
        }
    };

    const getClientName = (clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        return client ? `${client.profile?.first_name || ''} ${client.profile?.last_name || ''}`.trim() || client.email : 'Unknown';
    };

    const filteredDocuments = documents.filter(doc => {
        if (filter === 'all') return true;
        return doc.status === filter;
    });

    const statusColors: Record<string, 'info' | 'warning' | 'success' | 'error' | 'default'> = {
        pending: 'warning',
        verified: 'success',
        rejected: 'error',
        needs_correction: 'info',
    };

    const stats = {
        total: documents.length,
        pending: documents.filter(d => d.status === 'pending').length,
        verified: documents.filter(d => d.status === 'verified').length,
        rejected: documents.filter(d => d.status === 'rejected').length,
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <DocumentIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Document Verification</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Review and verify client documents</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total" value={stats.total} color="blue" />
                <StatsCard label="Pending" value={stats.pending} color="yellow" />
                <StatsCard label="Verified" value={stats.verified} color="green" />
                <StatsCard label="Rejected" value={stats.rejected} color="red" />
            </div>

            {/* Filter & List */}
            <Card>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filter:</span>
                    {['all', 'pending', 'verified', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {filteredDocuments.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredDocuments.map((doc) => (
                            <div key={doc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                        <span className="text-xl">📄</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{doc.file_name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                                            <span className="mx-2">•</span>
                                            <span>Client: {getClientName(doc.user_id)}</span>
                                        </p>
                                        {doc.comments && (
                                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">💬 {doc.comments}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 ml-16 md:ml-0">
                                    <Badge variant={statusColors[doc.status]}>{doc.status.replace('_', ' ')}</Badge>
                                    {doc.status === 'pending' && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => handleVerify(doc.id)}
                                            >
                                                Verify
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => setCommentModal({ id: doc.id, show: true, comment: '' })}
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-3xl">📄</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-1">No documents found</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {filter !== 'all' ? 'Try changing the filter' : 'Documents will appear here when clients upload them'}
                        </p>
                    </div>
                )}
            </Card>

            {/* Reject Modal */}
            {commentModal.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Reject Document</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Please provide a reason for rejection:
                        </p>
                        <textarea
                            value={commentModal.comment}
                            onChange={(e) => setCommentModal({ ...commentModal, comment: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white mb-4"
                            rows={3}
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setCommentModal({ id: 0, show: false, comment: '' })}>
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    // Note: Would need backend support for reject with comment
                                    setCommentModal({ id: 0, show: false, comment: '' });
                                    loadData();
                                }}
                                disabled={!commentModal.comment.trim()}
                            >
                                Reject
                            </Button>
                        </div>
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

function DocumentIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}
