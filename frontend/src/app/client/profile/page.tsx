'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { usersApi } from '@/lib/api';

export default function ProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        education_background: '',
        preferred_country: '',
        preferred_course: '',
        budget: '',
        passport_number: '',
    });

    useEffect(() => {
        if (user?.profile) {
            setFormData({
                first_name: user.profile.first_name || '',
                last_name: user.profile.last_name || '',
                phone: user.phone || '',
                address: user.profile.address || '',
                education_background: user.profile.education_background || '',
                preferred_country: user.profile.preferred_country || '',
                preferred_course: user.profile.preferred_course || '',
                budget: user.profile.budget || '',
                passport_number: user.profile.passport_number || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await usersApi.updateProfile(formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">Manage your personal information</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                            Profile updated successfully!
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                        />
                        <Input
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        <Input
                            label="Passport Number"
                            name="passport_number"
                            value={formData.passport_number}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Education Background</label>
                        <textarea
                            name="education_background"
                            value={formData.education_background}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Describe your educational qualifications..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            label="Preferred Country"
                            name="preferred_country"
                            value={formData.preferred_country}
                            onChange={handleChange}
                            placeholder="e.g., Canada, UK, Australia"
                        />
                        <Input
                            label="Preferred Course"
                            name="preferred_course"
                            value={formData.preferred_course}
                            onChange={handleChange}
                            placeholder="e.g., Computer Science, MBA"
                        />
                        <Input
                            label="Budget (USD)"
                            name="budget"
                            type="number"
                            value={formData.budget}
                            onChange={handleChange}
                            placeholder="e.g., 30000"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" loading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
