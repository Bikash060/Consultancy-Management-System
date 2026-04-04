'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Redirect to onboarding if profile_setup is false (client only)
    useEffect(() => {
        if (!loading && isAuthenticated && user && user.role === 'client' && !user.profile_setup && pathname !== '/client/onboarding') {
            router.replace('/client/onboarding');
        }
    }, [loading, isAuthenticated, user, pathname, router]);

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

    if (!isAuthenticated) return null;

    // Show onboarding page without sidebar
    if (pathname === '/client/onboarding') {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6" style={{ minWidth: 0 }}>
                <div className="animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
