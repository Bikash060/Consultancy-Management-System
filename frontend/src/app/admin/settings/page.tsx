'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        siteName: 'Consultancy Management System',
        contactEmail: 'info@consultancy.com',
        contactPhone: '+977-1234567890',
        address: 'Kathmandu, Nepal',
        workingHours: '9:00 AM - 5:00 PM',
        timezone: 'Asia/Kathmandu',
        // Email settings
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: '',
        // Notification settings
        emailNotifications: true,
        appointmentReminders: true,
        applicationUpdates: true,
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        alert('Settings saved successfully!');
    };

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'contact', label: 'Contact', icon: '📞' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
    ];

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <SettingsIcon className="w-8 h-8" />
                        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
                    </div>
                    <p className="text-white/70 max-w-lg">
                        Configure your consultancy system preferences and settings.
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute left-1/4 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <form onSubmit={handleSave}>
                {/* General Settings */}
                {activeTab === 'general' && (
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-xl">⚙️</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">General Settings</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Basic system configuration</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Site Name"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            />
                            <Input
                                label="Timezone"
                                value={settings.timezone}
                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                            />
                            <Input
                                label="Working Hours"
                                value={settings.workingHours}
                                onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                            />
                        </div>
                    </Card>
                )}

                {/* Contact Settings */}
                {activeTab === 'contact' && (
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <span className="text-xl">📞</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Contact Information</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Office contact details</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Contact Email"
                                type="email"
                                value={settings.contactEmail}
                                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                            />
                            <Input
                                label="Contact Phone"
                                value={settings.contactPhone}
                                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                            />
                            <div className="md:col-span-2">
                                <Input
                                    label="Office Address"
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <span className="text-xl">🔔</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Configure email and system notifications</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <ToggleItem
                                label="Email Notifications"
                                description="Receive email updates about system events"
                                checked={settings.emailNotifications}
                                onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                            />
                            <ToggleItem
                                label="Appointment Reminders"
                                description="Get reminded about upcoming appointments"
                                checked={settings.appointmentReminders}
                                onChange={(checked) => setSettings({ ...settings, appointmentReminders: checked })}
                            />
                            <ToggleItem
                                label="Application Updates"
                                description="Receive notifications when applications are updated"
                                checked={settings.applicationUpdates}
                                onChange={(checked) => setSettings({ ...settings, applicationUpdates: checked })}
                            />
                        </div>
                    </Card>
                )}

                {/* Save Button */}
                <div className="flex justify-end mt-6">
                    <Button type="submit" size="lg" className="min-w-[150px]">
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            'Save Settings'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

function ToggleItem({ label, description, checked, onChange }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div>
                <p className="font-medium text-slate-900 dark:text-white">{label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
            >
                <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );
}

function SettingsIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}
