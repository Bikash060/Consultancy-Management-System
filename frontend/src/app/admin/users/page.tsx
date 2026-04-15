'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Badge, Input, MetricCard, ChartCard, DonutChart } from '@/components/ui';
import { adminApi } from '@/lib/api';
import type { User } from '@/types';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [roleFilter, setRoleFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, has_next: false, has_prev: false });
    const perPage = 10;
    const [formData, setFormData] = useState({ email: '', password: '', first_name: '', last_name: '', phone: '', role: 'counselor' });
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers(roleFilter || undefined, page, perPage, searchTerm || undefined);
            setUsers(res.data.users || []);
            setPagination(res.data.pagination || { total: 0, pages: 1, has_next: false, has_prev: false });
        } catch (error) { console.error('Failed to load users:', error); } finally { setLoading(false); }
    }, [roleFilter, page, searchTerm]);

    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { setPage(1); }, [roleFilter, searchTerm]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault(); setFormError(''); setCreating(true);
        try {
            await adminApi.createUser(formData);
            setShowModal(false); setFormData({ email: '', password: '', first_name: '', last_name: '', phone: '', role: 'counselor' }); loadUsers();
        } catch (error: any) {
            setFormError(error.response?.data?.message || 'Failed to create user');
        } finally { setCreating(false); }
    };

    const toggleActive = async (id: number, isActive: boolean) => {
        try { await adminApi.updateUser(id, { is_active: !isActive }); loadUsers(); } catch (error) { console.error('Failed to update:', error); }
    };

    const roleColors: Record<string, 'info' | 'warning' | 'success' | 'default'> = { client: 'info', counselor: 'warning', admin: 'success' };

    const stats = {
        total: pagination.total,
        clients: users.filter(u => u.role === 'client').length,
        counselors: users.filter(u => u.role === 'counselor').length,
        active: users.filter(u => u.is_active).length,
    };

    const roleDistribution = [
        { name: 'Clients', value: stats.clients, color: '#3b82f6' },
        { name: 'Counselors', value: stats.counselors, color: '#f59e0b' },
        { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#10b981' },
    ].filter(item => item.value > 0);

    return (
        <div className="flex flex-col h-[calc(100vh-3rem)] overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 space-y-6 pb-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
                            </div>
                            <p className="text-white/80">Manage system users, roles, and permissions &middot; {pagination.total} total users</p>
                        </div>
                        <Button onClick={() => setShowModal(true)} className="bg-white text-purple-600 hover:bg-white/90"><span className="mr-2">+</span> Add User</Button>
                    </div>
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard title="Total Users" value={pagination.total} color="purple" icon={<svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                    <MetricCard title="Clients" value={stats.clients} color="blue" icon={<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                    <MetricCard title="Counselors" value={stats.counselors} color="orange" icon={<svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                    <MetricCard title="Active Users" value={stats.active} color="green" icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <ChartCard title="User Distribution" subtitle="Users by role" className="lg:col-span-1 overflow-auto">
                    {roleDistribution.length > 0 ? <DonutChart data={roleDistribution} height={220} innerRadius={50} /> : <div className="h-48 flex items-center justify-center text-slate-400">No users yet</div>}
                </ChartCard>

                <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                    {/* Search and Filter */}
                    <div className="flex-shrink-0 flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option value="">All Roles</option>
                            <option value="client">Clients</option>
                            <option value="counselor">Counselors</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>

                    {/* Scrollable Table */}
                    <div className="flex-1 overflow-auto min-h-0">
                        {loading ? (
                            <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" /></div>
                        ) : (
                            <table className="w-full">
                                <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">User</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Role</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, idx) => (
                                        <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500'][idx % 4]} flex items-center justify-center text-white font-medium text-sm`}>
                                                        {(u.profile?.first_name?.[0] || u.email[0]).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{u.profile?.first_name} {u.profile?.last_name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4"><Badge variant={roleColors[u.role]}>{u.role}</Badge></td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {u.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const action = u.is_active ? 'deactivate' : 'activate';
                                                            if (confirm(`Are you sure you want to ${action} ${u.profile?.first_name || u.email}?`)) {
                                                                toggleActive(u.id, u.is_active);
                                                            }
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                            u.is_active
                                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                                                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                                                        }`}
                                                    >
                                                        {u.is_active ? '⛔ Deactivate' : '✅ Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && users.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><span className="text-3xl">{'\u{1F464}'}</span></div>
                                <p className="text-slate-600 dark:text-slate-300">No users found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Page {page} of {pagination.pages} &middot; {pagination.total} total
                            </p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={() => setPage(p => p - 1)} disabled={!pagination.has_prev}>Previous</Button>
                                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                    const p = i + Math.max(1, page - 2);
                                    if (p > pagination.pages) return null;
                                    return <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{p}</button>;
                                })}
                                <Button size="sm" variant="secondary" onClick={() => setPage(p => p + 1)} disabled={!pagination.has_next}>Next</Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New User</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Create a new system user account</p>
                            </div>
                            <button onClick={() => { setShowModal(false); setFormError(''); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{formError}</div>}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
                                <Input label="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
                            </div>
                            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Optional" />
                            <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required helper="Min 8 chars, uppercase, lowercase, number" />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['client', 'counselor', 'admin'].map((role) => (
                                        <button key={role} type="button" onClick={() => setFormData({ ...formData, role })}
                                            className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all capitalize ${formData.role === role ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                            <span className="block text-lg mb-1">{role === 'client' ? '\u{1F464}' : role === 'counselor' ? '\u{1F4BC}' : '\u{1F6E1}\uFE0F'}</span>
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setFormError(''); }} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1" loading={creating}>Create User</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
