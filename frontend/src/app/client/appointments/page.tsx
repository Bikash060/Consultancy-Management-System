'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { appointmentsApi, usersApi } from '@/lib/api';
import type { Appointment, User } from '@/types';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [counselors, setCounselors] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        counselor_id: '',
        scheduled_at: '',
        type: 'online',
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [apptRes, counselorRes] = await Promise.all([
                appointmentsApi.getAll(),
                usersApi.getCounselors(),
            ]);
            setAppointments(apptRes.data.appointments || []);
            setCounselors(counselorRes.data.counselors || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await appointmentsApi.create({
                counselor_id: parseInt(formData.counselor_id),
                scheduled_at: formData.scheduled_at,
                type: formData.type,
                notes: formData.notes,
            });
            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Failed to book appointment:', error);
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await appointmentsApi.cancel(id);
            loadData();
        } catch (error) {
            console.error('Failed to cancel:', error);
        }
    };

    const statusColors: Record<string, 'info' | 'warning' | 'success' | 'error' | 'default'> = {
        pending: 'warning',
        accepted: 'success',
        rejected: 'error',
        completed: 'info',
        cancelled: 'default',
    };

    if (loading) {
        return <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-600 mt-1">Book and manage your counseling sessions</p>
                </div>
                <Button onClick={() => setShowModal(true)}>Book Appointment</Button>
            </div>

            <Card>
                {appointments.length > 0 ? (
                    <div className="divide-y">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {new Date(apt.scheduled_at).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-500 capitalize">{apt.type} meeting</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={statusColors[apt.status]}>{apt.status}</Badge>
                                    {apt.status === 'pending' && (
                                        <Button variant="danger" size="sm" onClick={() => handleCancel(apt.id)}>Cancel</Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No appointments yet. Book your first session!</p>
                )}
            </Card>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Book Appointment</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Counselor</label>
                                <select
                                    value={formData.counselor_id}
                                    onChange={(e) => setFormData({ ...formData, counselor_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                >
                                    <option value="">Select Counselor</option>
                                    {counselors.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.profile?.first_name} {c.profile?.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduled_at}
                                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    rows={2}
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit">Book</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
