'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Badge } from '@/components/ui';
import { documentsApi } from '@/lib/api';
import type { Document } from '@/types';

const DOC_TYPES = [
    { value: 'transcript', label: 'Transcript', icon: '📜' },
    { value: 'sop', label: 'Statement of Purpose', icon: '✍️' },
    { value: 'bank_statement', label: 'Bank Statement', icon: '🏦' },
    { value: 'recommendation', label: 'Recommendation Letter', icon: '📨' },
    { value: 'certificate', label: 'Certificate', icon: '📄' },
    { value: 'other', label: 'Other', icon: '📎' },
];

const statusConfig: Record<string, { variant: 'info' | 'warning' | 'success' | 'error' | 'default'; icon: string }> = {
    pending: { variant: 'warning', icon: '⏳' },
    verified: { variant: 'success', icon: '✅' },
    rejected: { variant: 'error', icon: '❌' },
    needs_correction: { variant: 'info', icon: '🔄' },
};

const ALLOWED_EXTENSIONS = ['pdf', 'png'];
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [selectedType, setSelectedType] = useState('transcript');
    const [dragActive, setDragActive] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const passportInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const res = await documentsApi.getAll();
            setDocuments(res.data.documents || []);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    // Passport documents
    const passportDocs = documents.filter(d => d.type === 'passport');
    const hasPassport = passportDocs.length > 0;

    // Other documents (non-passport)
    const otherDocs = documents.filter(d => d.type !== 'passport');

    // Count per type
    const countByType = (type: string) => otherDocs.filter(d => d.type === type).length;

    const validateFile = (file: File, docType: string): string | null => {
        // Check file extension
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return `Only PDF and PNG files are allowed. You selected a .${ext} file.`;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 16MB.';
        }

        // Check duplicate filename
        const existingNames = documents.filter(d => d.type === docType).map(d => d.file_name.toLowerCase());
        if (existingNames.includes(file.name.toLowerCase())) {
            return `A file named "${file.name}" already exists for this document type.`;
        }

        // Check passport limit
        if (docType === 'passport' && hasPassport) {
            return 'You can only have one passport document. Delete the existing one first or use Replace.';
        }

        // Check max 2 per non-passport type
        if (docType !== 'passport' && countByType(docType) >= 2) {
            return `Maximum 2 documents allowed per type. You already have ${countByType(docType)}.`;
        }

        return null;
    };

    const uploadFile = useCallback(async (file: File, docType: string) => {
        setUploadError('');
        const error = validateFile(file, docType);
        if (error) {
            setUploadError(error);
            return;
        }

        setUploading(true);
        try {
            await documentsApi.upload(file, docType);
            loadDocuments();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; error?: string } } };
            setUploadError(error.response?.data?.message || error.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (passportInputRef.current) passportInputRef.current.value = '';
        }
    }, [documents, hasPassport]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadFile(file, selectedType);
    };

    const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadFile(file, 'passport');
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file, selectedType);
    }, [uploadFile, selectedType]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            await documentsApi.delete(id);
            loadDocuments();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleReplacePassport = async () => {
        if (!hasPassport) return;
        if (!confirm('This will replace your existing passport document. Continue?')) return;
        // Delete existing passport first
        try {
            await documentsApi.delete(passportDocs[0].id);
            // Reload documents so the passport check is cleared
            const res = await documentsApi.getAll();
            setDocuments(res.data.documents || []);
            // Trigger file input after state update
            setTimeout(() => passportInputRef.current?.click(), 100);
        } catch (error) {
            console.error('Failed to delete passport:', error);
        }
    };

    const handleView = (doc: Document) => {
        const url = documentsApi.getViewUrl(doc.id);
        window.open(url, '_blank');
    };

    const stats = {
        total: documents.length,
        verified: documents.filter(d => d.status === 'verified').length,
        pending: documents.filter(d => d.status === 'pending').length,
        rejected: documents.filter(d => d.status === 'rejected' || d.status === 'needs_correction').length,
    };

    const filtered = filter === 'all' ? otherDocs : otherDocs.filter(d => d.status === filter);

    const getFileIcon = (fileName: string) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return '📕';
        if (ext === 'png') return '🖼️';
        return '📄';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Loading documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnptMC00VjI0SDI0djJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-3xl">📁</span> Documents
                        </h1>
                        <p className="text-white/80 mt-1">Upload, manage, and track your documents</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
                            <span className="text-white/70">Total:</span> <span className="font-bold">{stats.total}</span>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
                            <span className="text-white/70">Verified:</span> <span className="font-bold text-emerald-200">{stats.verified}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Error */}
            {uploadError && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {uploadError}
                    <button onClick={() => setUploadError('')} className="ml-auto text-red-500 hover:text-red-700">✕</button>
                </div>
            )}

            {/* ===== PASSPORT SECTION ===== */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-amber-800/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20">
                        🛂
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Passport</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Only 1 passport document allowed • PDF or PNG only</p>
                    </div>
                </div>

                <input
                    ref={passportInputRef}
                    type="file"
                    onChange={handlePassportUpload}
                    accept=".pdf,.png"
                    className="hidden"
                />

                {hasPassport ? (
                    <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200 dark:border-amber-800/30">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl">
                                {getFileIcon(passportDocs[0].file_name)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">{passportDocs[0].file_name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant={statusConfig[passportDocs[0].status]?.variant || 'default'}>
                                        {statusConfig[passportDocs[0].status]?.icon} {passportDocs[0].status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleView(passportDocs[0])}
                                className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                                👁️ View
                            </button>
                            <button
                                onClick={handleReplacePassport}
                                className="px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors"
                            >
                                🔄 Replace
                            </button>
                            <button
                                onClick={() => handleDelete(passportDocs[0].id)}
                                className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => passportInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">📤</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">Upload your passport</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">PDF or PNG only (Max 16MB)</p>
                        </div>
                    </button>
                )}

                {passportDocs[0]?.comments && (
                    <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                        <p className="text-sm text-blue-700 dark:text-blue-300">💬 {passportDocs[0].comments}</p>
                    </div>
                )}
            </div>

            {/* ===== OTHER DOCUMENTS SECTION ===== */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm">⬆️</span>
                    Upload Other Documents
                    <span className="text-xs font-normal text-slate-400 ml-2">(Max 2 per type)</span>
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    >
                        {DOC_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.icon} {t.label} ({countByType(t.value)}/2)
                            </option>
                        ))}
                    </select>
                    {countByType(selectedType) >= 2 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                            ⚠️ Max reached for this type
                        </span>
                    )}
                </div>
                {/* Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                        countByType(selectedType) >= 2
                            ? 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                            : dragActive
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 scale-[1.01]'
                            : 'border-slate-300 dark:border-slate-600 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleUpload}
                        accept=".pdf,.png"
                        className="hidden"
                        disabled={countByType(selectedType) >= 2}
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full" />
                            <p className="text-violet-600 dark:text-violet-400 font-medium">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center text-2xl">
                                📤
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                                {dragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                PDF and PNG only (Max 16MB)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                    { key: 'all', label: 'All', count: otherDocs.length },
                    { key: 'pending', label: 'Pending', count: otherDocs.filter(d => d.status === 'pending').length },
                    { key: 'verified', label: 'Verified', count: otherDocs.filter(d => d.status === 'verified').length },
                    { key: 'rejected', label: 'Issues', count: otherDocs.filter(d => d.status === 'rejected' || d.status === 'needs_correction').length },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                            filter === tab.key
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600'
                        }`}
                    >
                        {tab.label}
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                            filter === tab.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'
                        }`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Documents Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((doc) => {
                        const cfg = statusConfig[doc.status] || { variant: 'default' as const, icon: '📄' };
                        return (
                            <div
                                key={doc.id}
                                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-200 group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                                            {getFileIcon(doc.file_name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white truncate">{doc.file_name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1 mt-0.5">
                                                {DOC_TYPES.find(t => t.value === doc.type)?.icon || '📎'} {doc.type.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={cfg.variant}>
                                        {cfg.icon} {doc.status.replace('_', ' ')}
                                    </Badge>
                                </div>

                                {doc.comments && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 mb-3">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">💬 {doc.comments}</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleView(doc)}
                                            className="text-xs text-blue-600 dark:text-blue-400 font-medium transition-all px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        >
                                            👁️ View
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-all px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl mx-auto mb-4">
                        📂
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {filter === 'all' ? 'No documents yet' : `No ${filter} documents`}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {filter === 'all'
                            ? 'Upload your first document using the section above.'
                            : 'Try a different filter or upload more documents.'}
                    </p>
                </div>
            )}
        </div>
    );
}
