'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';

interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
}

const clientNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/client', icon: <HomeIcon /> },
    { name: 'Profile', path: '/client/profile', icon: <UserIcon /> },
    { name: 'Appointments', path: '/client/appointments', icon: <CalendarIcon /> },
    { name: 'Documents', path: '/client/documents', icon: <DocumentIcon /> },
    { name: 'Applications', path: '/client/applications', icon: <FolderIcon /> },
    { name: 'Messages', path: '/client/messages', icon: <ChatIcon /> },
    { name: 'AI Assistant', path: '/client/chat', icon: <SparklesIcon /> },
];

const counselorNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/counselor', icon: <HomeIcon /> },
    { name: 'Clients', path: '/counselor/clients', icon: <UsersIcon /> },
    { name: 'Appointments', path: '/counselor/appointments', icon: <CalendarIcon /> },
    { name: 'Documents', path: '/counselor/documents', icon: <DocumentIcon /> },
    { name: 'Applications', path: '/counselor/applications', icon: <FolderIcon /> },
    { name: 'Messages', path: '/counselor/messages', icon: <ChatIcon /> },
];

const adminNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/admin', icon: <HomeIcon /> },
    { name: 'Users', path: '/admin/users', icon: <UsersIcon /> },
    { name: 'Reports', path: '/admin/reports', icon: <ChartIcon /> },
    { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileOpen]);

    const getNavItems = () => {
        switch (user?.role) {
            case 'counselor': return counselorNavItems;
            case 'admin': return adminNavItems;
            default: return clientNavItems;
        }
    };

    const navItems = getNavItems();

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg md:hidden"
                aria-label="Open menu"
            >
                <MenuIcon />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:sticky top-0 left-0 h-screen z-50
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    bg-white dark:bg-slate-900
                    border-r border-slate-200 dark:border-slate-800
                    flex flex-col
                    transition-all duration-300 ease-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    shadow-xl md:shadow-none
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <span className="text-white text-lg">🎓</span>
                                </div>
                                <div>
                                    <h1 className="font-bold text-slate-900 dark:text-white">Consultancy</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Management</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
                        >
                            <CloseIcon />
                        </button>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <ChevronIcon className={isCollapsed ? 'rotate-180' : ''} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                                    transition-all duration-200
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 font-medium'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white
                            transition-all duration-200
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                    >
                        <span className="w-5 h-5 flex-shrink-0">
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </span>
                        {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    {/* User Info */}
                    {!isCollapsed && user && (
                        <div className="px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {user.profile?.first_name?.[0] || user.email[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {user.profile?.first_name} {user.profile?.last_name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                            transition-all duration-200
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                    >
                        <span className="w-5 h-5 flex-shrink-0"><LogoutIcon /></span>
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}

// Icons (keeping the same icon components)
function HomeIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function DocumentIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}

function FolderIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    );
}

function ChatIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    );
}

function SparklesIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-slate-700 dark:text-slate-300">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-slate-700 dark:text-slate-300">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

function ChevronIcon({ className = '' }: { className?: string }) {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={`w-5 h-5 text-slate-500 transition-transform ${className}`}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    );
}

function SunIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );
}
