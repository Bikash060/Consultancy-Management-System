'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Badge, Input, MetricCard, ChartCard, DonutChart } from '@/components/ui';
import { adminApi } from '@/lib/api';
import type { User } from '@/types';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'counselor',
    });

    const loadUsers = useCallback(async () => {
        try {
            const res = await adminApi.getUsers(filter || undefined);
            setUsers(res.data.users || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminApi.createUser(formData);
            setShowModal(false);
            setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'counselor' });
            loadUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
        }
    };

    const toggleActive = async (id: number, isActive: boolean) => {
        try {
            await adminApi.updateUser(id, { is_active: !isActive });
            loadUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const roleColors: Record<string, 'info' | 'warning' | 'success' | 'default'> = {
        client: 'info',
        counselor: 'warning',
        admin: 'success',
    };

    // Stats
    const stats = {
        total: users.length,
        clients: users.filter(u => u.role === 'client').length,
        counselors: users.filter(u => u.role === 'counselor').length,
        admins: users.filter(u => u.role === 'admin').length,
        active: users.filter(u => u.is_active).length,
    };

    // Role distribution for chart
    const roleDistribution = [
        { name: 'Clients', value: stats.clients, color: '#3b82f6' },
        { name: 'Counselors', value: stats.counselors, color: '#f59e0b' },
        { name: 'Admins', value: stats.admins, color: '#10b981' },
    ].filter(item => item.value > 0);

    // Filter users by search
    const filteredUsers = users.filter(u => {
        const fullName = `${u.profile?.first_name || ''} ${u.profile?.last_name || ''}`.toLowerCase();
        const email = u.email.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
                    ))}
                </div>
                <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <UsersIcon className="w-8 h-8" />
                            <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
                        </div>
                        <p className="text-white/80">Manage system users, roles, and permissions</p>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="bg-white text-purple-600 hover:bg-white/90">
                        <span className="mr-2">+</span> Add User
                    </Button>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Users"
                    value={stats.total}
                    color="purple"
                    icon={<UsersIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                />
                <MetricCard
                    title="Clients"
                    value={stats.clients}
                    color="blue"
                    icon={<UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                />
                <MetricCard
                    title="Counselors"
                    value={stats.counselors}
                    color="orange"
                    icon={<BriefcaseIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                />
                <MetricCard
                    title="Active Users"
                    value={stats.active}
                    color="green"
                    icon={<CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                />
            </div>

            {/* Chart and Table Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role Distribution Chart */}
                <ChartCard
                    title="User Distribution"
                    subtitle="Users by role"
                    className="lg:col-span-1"
                >
                    {roleDistribution.length > 0 ? (
                        <DonutChart data={roleDistribution} height={220} innerRadius={50} />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400">
                            No users yet
                        </div>
                    )}
                </ChartCard>

                {/* Users Table */}
                <Card className="lg:col-span-2">
                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Roles</option>
                            <option value="client">Clients</option>
                            <option value="counselor">Counselors</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">User</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u, idx) => (
                                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500'][idx % 4]
                                                    } flex items-center justify-center text-white font-medium`}>
                                                    {(u.profile?.first_name?.[0] || u.email[0]).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {u.profile?.first_name} {u.profile?.last_name}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge variant={roleColors[u.role]}>{u.role}</Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.is_active
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {u.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Button
                                                size="sm"
                                                variant={u.is_active ? 'danger' : 'primary'}
                                                onClick={() => toggleActive(u.id, u.is_active)}
                                            >
                                                {u.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    <span className="text-3xl">👤</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300">No users found</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card className="w-full max-w-md m-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New User</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Last Name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    required
                                />
                            </div>
                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="client">Client</option>
                                    <option value="counselor">Counselor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Create User
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
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

function UserIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

function BriefcaseIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

function CheckIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function XIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}
