'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { adminApi } from '@/lib/api';

interface Course {
    id: number;
    name: string;
    duration?: string;
    fee?: string;
    is_active: boolean;
}

interface University {
    id: number;
    name: string;
    country_id: number;
    is_active: boolean;
    courses?: Course[];
}

interface Country {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
    universities: University[];
}

function getFlag(code: string): string {
    if (!code || code.length !== 2) return '\u{1F30D}';
    return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('countries');
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'Consultancy Management System',
        contactEmail: 'info@consultancy.com',
        contactPhone: '+977-1234567890',
        address: 'Kathmandu, Nepal',
        workingHours: '9:00 AM - 5:00 PM',
        timezone: 'Asia/Kathmandu',
        emailNotifications: true,
        appointmentReminders: true,
        applicationUpdates: true,
    });
    const [showCountryForm, setShowCountryForm] = useState(false);
    const [countryForm, setCountryForm] = useState({ name: '', code: '' });
    const [editingCountry, setEditingCountry] = useState<number | null>(null);
    const [showUniForm, setShowUniForm] = useState<number | null>(null);
    const [uniForm, setUniForm] = useState({ name: '' });
    const [expandedCountry, setExpandedCountry] = useState<number | null>(null);
    const [showCourseForm, setShowCourseForm] = useState<number | null>(null);
    const [courseForm, setCourseForm] = useState({ name: '', duration: '', fee: '' });
    const [expandedUni, setExpandedUni] = useState<number | null>(null);
    // Intakes state
    const [intakes, setIntakes] = useState<{ id: number; name: string; year: number }[]>([]);
    const [intakeForm, setIntakeForm] = useState({ name: '', year: new Date().getFullYear().toString() });
    const [intakeLoading, setIntakeLoading] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [countriesRes, settingsRes] = await Promise.all([
                adminApi.getCountries(),
                adminApi.getSettings().catch(() => ({ data: { settings: {} } })),
            ]);
            setCountries(countriesRes.data.countries || []);
            const s = settingsRes.data.settings || {};
            setSettings((prev) => ({ ...prev, siteName: s.siteName || prev.siteName, contactEmail: s.contactEmail || prev.contactEmail, contactPhone: s.contactPhone || prev.contactPhone, address: s.address || prev.address, workingHours: s.workingHours || prev.workingHours, timezone: s.timezone || prev.timezone, emailNotifications: s.emailNotifications !== 'false', appointmentReminders: s.appointmentReminders !== 'false', applicationUpdates: s.applicationUpdates !== 'false' }));
            // Load intakes
            try {
                const intakesRes = await adminApi.getIntakes();
                setIntakes(intakesRes.data.intakes || []);
            } catch { /* intakes may not exist yet */ }
        } catch (error) { console.error('Failed to load settings:', error); } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try { await adminApi.updateSettings({ ...settings, emailNotifications: String(settings.emailNotifications), appointmentReminders: String(settings.appointmentReminders), applicationUpdates: String(settings.applicationUpdates) }); } catch (error) { console.error('Failed to save:', error); } finally { setSaving(false); }
    };

    const handleAddCountry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCountry) { await adminApi.updateCountry(editingCountry, countryForm); }
            else { await adminApi.createCountry(countryForm); }
            setCountryForm({ name: '', code: '' }); setShowCountryForm(false); setEditingCountry(null); loadData();
        } catch (error) { console.error('Failed to save country:', error); }
    };

    const handleDeleteCountry = async (id: number) => {
        if (!confirm('Delete this country and all its universities?')) return;
        try { await adminApi.deleteCountry(id); loadData(); } catch (error) { console.error('Failed to delete:', error); }
    };

    const startEditCountry = (c: Country) => { setCountryForm({ name: c.name, code: c.code }); setEditingCountry(c.id); setShowCountryForm(true); };

    const handleAddUniversity = async (e: React.FormEvent, countryId: number) => {
        e.preventDefault();
        try { await adminApi.createUniversity(countryId, { name: uniForm.name }); setUniForm({ name: '' }); setShowUniForm(null); loadData(); } catch (error) { console.error('Failed to add university:', error); }
    };

    const handleDeleteUniversity = async (id: number) => {
        if (!confirm('Delete this university?')) return;
        try { await adminApi.deleteUniversity(id); loadData(); } catch (error) { console.error('Failed to delete:', error); }
    };

    const handleAddCourse = async (e: React.FormEvent, universityId: number) => {
        e.preventDefault();
        try {
            await adminApi.createCourse(universityId, { name: courseForm.name, duration: courseForm.duration || undefined, fee: courseForm.fee || undefined });
            setCourseForm({ name: '', duration: '', fee: '' });
            setShowCourseForm(null);
            loadData();
        } catch (error) { console.error('Failed to add course:', error); }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!confirm('Delete this course?')) return;
        try { await adminApi.deleteCourse(id); loadData(); } catch (error) { console.error('Failed to delete course:', error); }
    };

    const handleAddIntake = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!intakeForm.name.trim()) return;
        setIntakeLoading(true);
        try {
            await adminApi.addIntake({ name: intakeForm.name.trim(), year: parseInt(intakeForm.year) });
            setIntakeForm({ name: '', year: new Date().getFullYear().toString() });
            loadData();
        } catch (error) { console.error('Failed to add intake:', error); }
        finally { setIntakeLoading(false); }
    };

    const handleDeleteIntake = async (id: number) => {
        if (!confirm('Delete this intake?')) return;
        try { await adminApi.deleteIntake(id); loadData(); } catch (error) { console.error('Failed to delete intake:', error); }
    };

    const tabs = [
        { id: 'countries', label: 'Countries & Universities', icon: '\u{1F30D}' },
        { id: 'intakes', label: 'Intakes', icon: '\u{1F4C5}' },
        { id: 'general', label: 'General', icon: '\u2699\uFE0F' },
        { id: 'notifications', label: 'Notifications', icon: '\u{1F514}' },
    ];

    if (loading) return (<div className="space-y-6"><div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" /><div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" /></div>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
                    </div>
                    <p className="text-white/70 max-w-lg">Manage countries, universities, and system preferences.</p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        <span>{tab.icon}</span><span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Countries & Universities Tab */}
            {activeTab === 'countries' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Appointing Countries & Affiliated Universities</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Add the countries your consultancy operates with and their affiliated universities.</p>
                        </div>
                        <Button onClick={() => { setCountryForm({ name: '', code: '' }); setEditingCountry(null); setShowCountryForm(true); }}>+ Add Country</Button>
                    </div>

                    {showCountryForm && (
                        <Card className="border-2 border-blue-200 dark:border-blue-800">
                            <form onSubmit={handleAddCountry} className="space-y-4">
                                <h3 className="text-md font-semibold text-slate-900 dark:text-white">{editingCountry ? 'Edit Country' : 'Add New Country'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <Input label="Country Name" placeholder="e.g. Australia" value={countryForm.name} onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })} required />
                                    <Input label="ISO Code (2 letters)" placeholder="e.g. AU" value={countryForm.code} onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase().slice(0, 2) })} required />
                                    <div className="flex gap-2">
                                        {countryForm.code.length === 2 && <span className="text-3xl self-center">{getFlag(countryForm.code)}</span>}
                                        <Button type="submit" className="flex-1">{editingCountry ? 'Update' : 'Add'}</Button>
                                        <Button type="button" variant="secondary" onClick={() => { setShowCountryForm(false); setEditingCountry(null); }}>Cancel</Button>
                                    </div>
                                </div>
                            </form>
                        </Card>
                    )}

                    {countries.length > 0 ? (
                        <div className="space-y-3">
                            {countries.map((country) => (
                                <Card key={country.id} className="overflow-hidden">
                                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedCountry(expandedCountry === country.id ? null : country.id)}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{getFlag(country.code)}</span>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{country.name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{country.code} &middot; {country.universities.length} universit{country.universities.length === 1 ? 'y' : 'ies'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); startEditCountry(country); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCountry(country.id); }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedCountry === country.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {expandedCountry === country.id && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Affiliated Universities</h4>
                                                <Button size="sm" variant="secondary" onClick={() => { setShowUniForm(country.id); setUniForm({ name: '' }); }}>+ Add University</Button>
                                            </div>
                                            {showUniForm === country.id && (
                                                <form onSubmit={(e) => handleAddUniversity(e, country.id)} className="flex gap-3 mb-4">
                                                    <input type="text" value={uniForm.name} onChange={(e) => setUniForm({ name: e.target.value })} placeholder="University name..." className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                                    <Button type="submit" size="sm">Add</Button>
                                                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowUniForm(null)}>Cancel</Button>
                                                </form>
                                            )}
                                            {country.universities.length > 0 ? (
                                                <div className="space-y-2">
                                                    {country.universities.map((uni) => (
                                                        <div key={uni.id} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                                                            <div className="flex items-center justify-between py-2.5 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => setExpandedUni(expandedUni === uni.id ? null : uni.id)}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><span className="text-sm">{'\u{1F3DB}\uFE0F'}</span></div>
                                                                    <div>
                                                                        <span className="font-medium text-slate-700 dark:text-slate-200">{uni.name}</span>
                                                                        <span className="text-xs text-slate-400 ml-2">{uni.courses?.length || 0} courses</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteUniversity(uni.id); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    </button>
                                                                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedUni === uni.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                                </div>
                                                            </div>
                                                            {/* Courses section */}
                                                            {expandedUni === uni.id && (
                                                                <div className="px-4 pb-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses</span>
                                                                        <button onClick={() => { setShowCourseForm(uni.id); setCourseForm({ name: '', duration: '', fee: '' }); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Course</button>
                                                                    </div>
                                                                    {showCourseForm === uni.id && (
                                                                        <form onSubmit={(e) => handleAddCourse(e, uni.id)} className="flex gap-2 mb-3 items-end">
                                                                            <input type="text" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="Course name" required
                                                                                className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                                            <input type="text" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="Duration"
                                                                                className="w-24 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                                            <input type="text" value={courseForm.fee} onChange={(e) => setCourseForm({ ...courseForm, fee: e.target.value })} placeholder="Fee"
                                                                                className="w-24 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                                            <Button type="submit" size="sm">Add</Button>
                                                                            <Button type="button" size="sm" variant="secondary" onClick={() => setShowCourseForm(null)}>Cancel</Button>
                                                                        </form>
                                                                    )}
                                                                    {uni.courses && uni.courses.length > 0 ? (
                                                                        <div className="space-y-1">
                                                                            {uni.courses.map((course) => (
                                                                                <div key={course.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-white dark:hover:bg-slate-900/50 transition-colors text-sm">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                                                        <span className="text-slate-700 dark:text-slate-300">{course.name}</span>
                                                                                        {course.duration && <span className="text-xs text-slate-400">({course.duration})</span>}
                                                                                        {course.fee && <span className="text-xs text-emerald-600 dark:text-emerald-400">{course.fee}</span>}
                                                                                    </div>
                                                                                    <button onClick={() => handleDeleteCourse(course.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 transition-colors">
                                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-xs text-slate-400 text-center py-2">No courses yet</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No universities added yet. Click &quot;+ Add University&quot; to add one.</p>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-16">
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-5xl">{'\u{1F30D}'}</span>
                                <div><p className="text-lg font-semibold text-slate-900 dark:text-white">No countries added yet</p><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add the countries your consultancy operates with to get started.</p></div>
                                <Button onClick={() => setShowCountryForm(true)}>+ Add First Country</Button>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* General Settings Tab */}
            {activeTab === 'general' && (
                <form onSubmit={handleSaveSettings}>
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><span className="text-xl">{'\u2699\uFE0F'}</span></div>
                            <div><h3 className="text-lg font-semibold text-slate-900 dark:text-white">General Settings</h3><p className="text-sm text-slate-500 dark:text-slate-400">Basic system configuration</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Site Name" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                            <Input label="Contact Email" type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} />
                            <Input label="Contact Phone" value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} />
                            <Input label="Working Hours" value={settings.workingHours} onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })} />
                            <Input label="Timezone" value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
                            <div className="md:col-span-2"><Input label="Office Address" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} /></div>
                        </div>
                    </Card>
                    <div className="flex justify-end mt-6">
                        <Button type="submit" size="lg" className="min-w-[150px]">{saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Save Settings'}</Button>
                    </div>
                </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <form onSubmit={handleSaveSettings}>
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><span className="text-xl">{'\u{1F514}'}</span></div>
                            <div><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h3><p className="text-sm text-slate-500 dark:text-slate-400">Configure email and system notifications</p></div>
                        </div>
                        <div className="space-y-4">
                            <ToggleItem label="Email Notifications" description="Receive email updates about system events" checked={settings.emailNotifications} onChange={(v) => setSettings({ ...settings, emailNotifications: v })} />
                            <ToggleItem label="Appointment Reminders" description="Get reminded about upcoming appointments" checked={settings.appointmentReminders} onChange={(v) => setSettings({ ...settings, appointmentReminders: v })} />
                            <ToggleItem label="Application Updates" description="Receive notifications when applications are updated" checked={settings.applicationUpdates} onChange={(v) => setSettings({ ...settings, applicationUpdates: v })} />
                        </div>
                    </Card>
                    <div className="flex justify-end mt-6">
                        <Button type="submit" size="lg" className="min-w-[150px]">{saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Save Settings'}</Button>
                    </div>
                </form>
            )}

            {/* Intakes Tab */}
            {activeTab === 'intakes' && (
                <div className="space-y-6">
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><span className="text-xl">{'\u{1F4C5}'}</span></div>
                            <div><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Manage Intakes</h3><p className="text-sm text-slate-500 dark:text-slate-400">Add or remove available intakes for client applications</p></div>
                        </div>

                        {/* Add intake form */}
                        <form onSubmit={handleAddIntake} className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <input
                                type="text"
                                value={intakeForm.name}
                                onChange={(e) => setIntakeForm({ ...intakeForm, name: e.target.value })}
                                placeholder="e.g. Fall, Spring, Summer..."
                                required
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="number"
                                value={intakeForm.year}
                                onChange={(e) => setIntakeForm({ ...intakeForm, year: e.target.value })}
                                placeholder="Year"
                                min="2024"
                                max="2030"
                                required
                                className="w-28 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <Button type="submit" disabled={intakeLoading}>
                                {intakeLoading ? 'Adding...' : '+ Add Intake'}
                            </Button>
                        </form>

                        {/* Intakes list */}
                        {intakes.length > 0 ? (
                            <div className="space-y-2">
                                {intakes.map((intake) => (
                                    <div key={intake.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                                <span className="text-lg">{'\u{1F4C5}'}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{intake.name} {intake.year}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteIntake(intake.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Delete intake"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <span className="text-4xl mb-4 block">{'\u{1F4C5}'}</span>
                                <p className="text-slate-600 dark:text-slate-400">No intakes added yet</p>
                                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Add intakes using the form above</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}

function ToggleItem({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div><p className="font-medium text-slate-900 dark:text-white">{label}</p><p className="text-sm text-slate-500 dark:text-slate-400">{description}</p></div>
            <button type="button" onClick={() => onChange(!checked)} className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}
