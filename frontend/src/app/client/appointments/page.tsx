'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { appointmentsApi, usersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Appointment, User } from '@/types';

export default function AppointmentsPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [counselors, setCounselors] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        counselor_id: '',
        date: '',
        time: '',
        type: 'online',
        notes: '',
    });

    // Compute min date (today) and min time (now if today is selected)
    const today = useMemo(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    }, []);

    const minTime = useMemo(() => {
        if (formData.date === today) {
            const d = new Date();
            d.setMinutes(d.getMinutes() + 30); // at least 30 min from now
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        return '08:00';
    }, [formData.date, today]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [apptRes, counselorRes] = await Promise.all([
                appointmentsApi.getAll(),
                usersApi.getCounselors(),
            ]);
            setAppointments(apptRes.data.appointments || []);
            const allCounselors: User[] = counselorRes.data.counselors || [];
            setCounselors(allCounselors);
            // Pre-select assigned counselor and lock it
            if (user?.assigned_counselor_id) {
                setFormData(prev => ({ ...prev, counselor_id: String(user.assigned_counselor_id) }));
            }
        } catch (error) { console.error('Failed to load data:', error); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formData.date || !formData.time) {
            setFormError('Please select both date and time');
            return;
        }

        const scheduledAt = `${formData.date}T${formData.time}`;
        const selectedDate = new Date(scheduledAt);
        const now = new Date();

        if (selectedDate <= now) {
            setFormError('Please select a future date and time');
            return;
        }

        setSubmitting(true);
        try {
            await appointmentsApi.create({
                counselor_id: parseInt(formData.counselor_id),
                scheduled_at: scheduledAt,
                type: formData.type,
                notes: formData.notes,
            });
            setShowModal(false);
            setFormData({ counselor_id: '', date: '', time: '', type: 'online', notes: '' });
            loadData();
        } catch (error) {
            console.error('Failed to book appointment:', error);
            setFormError('Failed to book appointment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Cancel this appointment?')) return;
        try { await appointmentsApi.cancel(id); loadData(); }
        catch (error) { console.error('Failed to cancel:', error); }
    };

    const statusConfig: Record<string, { variant: 'info' | 'warning' | 'success' | 'error' | 'default'; icon: string }> = {
        pending: { variant: 'warning', icon: '\u23f3' },
        accepted: { variant: 'success', icon: '\u2705' },
        rejected: { variant: 'error', icon: '\u274c' },
        completed: { variant: 'info', icon: '\u2714\ufe0f' },
        cancelled: { variant: 'default', icon: '\ud83d\udeab' },
    };

    const now = new Date();
    const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= now && a.status !== 'cancelled').sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    const past = appointments.filter(a => new Date(a.scheduled_at) < now || a.status === 'cancelled').sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <h1 className="text-2xl md:text-3xl font-bold">Appointments</h1>
                        </div>
                        <p className="text-white/80">Book and manage your counseling sessions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 rounded-xl px-4 py-2 text-sm">
                            <span className="text-white/70">Total: </span>
                            <span className="font-semibold">{appointments.length}</span>
                        </div>
                        <Button onClick={() => setShowModal(true)} className="bg-white text-emerald-600 hover:bg-white/90">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Book Appointment
                        </Button>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Upcoming */}
            {upcoming.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Upcoming
                    </h2>
                    <div className="space-y-3">
                        {upcoming.map((apt) => (
                            <Card key={apt.id} hover className="!p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{new Date(apt.scheduled_at).toLocaleDateString('en', { month: 'short' })}</span>
                                            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300 leading-tight">{new Date(apt.scheduled_at).getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {new Date(apt.scheduled_at).toLocaleDateString('en-US', { weekday: 'long' })}, {new Date(apt.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    {apt.type === 'online' ? (
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    ) : (
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                                    )}
                                                    {apt.type === 'online' ? 'Online' : 'In-person'}
                                                </span>
                                                {apt.notes && <span className="truncate max-w-[200px]">{apt.notes}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={statusConfig[apt.status]?.variant || 'default'}>
                                            {statusConfig[apt.status]?.icon} {apt.status}
                                        </Badge>
                                        {apt.status === 'pending' && (
                                            <button onClick={() => handleCancel(apt.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors" title="Cancel">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Past */}
            {past.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Past Appointments</h2>
                    <div className="space-y-2">
                        {past.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-400">{statusConfig[apt.status]?.icon}</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {new Date(apt.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        <span className="mx-1.5 text-slate-300">&middot;</span>
                                        {new Date(apt.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <Badge variant={statusConfig[apt.status]?.variant || 'default'}>{apt.status}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {appointments.length === 0 && (
                <Card className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-semibold text-lg">No appointments yet</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Book your first counseling session to get started.</p>
                        </div>
                        <Button onClick={() => setShowModal(true)}>Book Appointment</Button>
                    </div>
                </Card>
            )}

            {/* Book Appointment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Modal header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold">Book Appointment</h2>
                                            <p className="text-white/70 text-sm">Schedule a counseling session</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                            {formError && (
                                <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Counselor — locked to assigned counselor */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Counselor
                                        </span>
                                    </label>
                                    {(() => {
                                        const assignedCounselor = counselors.find(c => c.id === user?.assigned_counselor_id);
                                        return assignedCounselor ? (
                                            <div className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {assignedCounselor.profile?.first_name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{assignedCounselor.profile?.first_name} {assignedCounselor.profile?.last_name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Your assigned counselor</p>
                                                </div>
                                                <svg className="w-4 h-4 ml-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                        ) : (
                                            <select value={formData.counselor_id} onChange={e => setFormData({...formData, counselor_id: e.target.value})} required
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all">
                                                <option value="">Select a counselor...</option>
                                                {counselors.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.profile?.first_name} {c.profile?.last_name}</option>
                                                ))}
                                            </select>
                                        );
                                    })()}
                                </div>

                                {/* Date & Time — separate inputs */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                Date <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={e => {
                                                setFormData({...formData, date: e.target.value, time: ''});
                                                setFormError('');
                                            }}
                                            min={today}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Time <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={e => { setFormData({...formData, time: e.target.value}); setFormError(''); }}
                                            min={minTime}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Selected datetime preview */}
                                {formData.date && formData.time && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                                            {new Date(`${formData.date}T${formData.time}`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at{' '}
                                            {new Date(`${formData.date}T${formData.time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                )}

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            Meeting Type
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['online', 'offline'].map((t) => (
                                            <button key={t} type="button" onClick={() => setFormData({...formData, type: t})}
                                                className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                                                    formData.type === t
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/10'
                                                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }`}>
                                                {t === 'online' ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                )}
                                                {t === 'online' ? 'Online' : 'In-Person'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Notes <span className="text-slate-400 font-normal text-xs">(optional)</span>
                                        </span>
                                    </label>
                                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                                        rows={3} placeholder="What would you like to discuss?"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all resize-none" />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <button type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting || !formData.counselor_id || !formData.date || !formData.time}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                                        {submitting ? (
                                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Booking...</>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                Book Appointment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
