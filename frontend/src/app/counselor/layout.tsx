'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default function CounselorLayout({ children }: { children: React.ReactNode }) {
    const { loading, isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.replace('/login');
            } else if (user?.role !== 'counselor') {
                router.replace('/');
            }
        }
    }, [loading, isAuthenticated, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'counselor') return null;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6 overflow-x-hidden">
                <div className="animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
