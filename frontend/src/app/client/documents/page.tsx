'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { documentsApi } from '@/lib/api';
import type { Document } from '@/types';

const DOC_TYPES = [
    { value: 'passport', label: 'Passport' },
    { value: 'transcript', label: 'Transcript' },
    { value: 'sop', label: 'Statement of Purpose' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'recommendation', label: 'Recommendation Letter' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'other', label: 'Other' },
];

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState('passport');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await documentsApi.upload(file, selectedType);
            loadDocuments();
        } catch (error) {
            console.error('Failed to upload:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await documentsApi.delete(id);
            loadDocuments();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const statusColors: Record<string, 'info' | 'warning' | 'success' | 'error' | 'default'> = {
        pending: 'warning',
        verified: 'success',
        rejected: 'error',
        needs_correction: 'info',
    };

    if (loading) {
        return <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                <p className="text-gray-600 mt-1">Upload and manage your documents</p>
            </div>

            <Card className="mb-6">
                <h3 className="font-medium mb-4">Upload New Document</h3>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        {DOC_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleUpload}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()} loading={uploading}>
                        {uploading ? 'Uploading...' : 'Select File'}
                    </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Allowed: PDF, JPG, PNG, DOC, DOCX (Max 16MB)</p>
            </Card>

            <Card title="Your Documents">
                {documents.length > 0 ? (
                    <div className="divide-y">
                        {documents.map((doc) => (
                            <div key={doc.id} className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{doc.file_name}</p>
                                    <p className="text-sm text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                                    {doc.comments && (
                                        <p className="text-sm text-blue-600 mt-1">💬 {doc.comments}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={statusColors[doc.status]}>{doc.status.replace('_', ' ')}</Badge>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(doc.id)}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
                )}
            </Card>
        </div>
    );
}
