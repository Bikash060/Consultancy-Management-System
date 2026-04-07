'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { applicationsApi, usersApi, adminApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/types';

const STEPS = [
    { id: 1, title: 'Select Intake', icon: '📅' },
    { id: 2, title: 'Select Country', icon: '🌍' },
    { id: 3, title: 'Select University', icon: '🏛️' },
    { id: 4, title: 'Select Course', icon: '📚' },
    { id: 5, title: 'Application Details', icon: '📝' },
];

interface CourseOption { id: number; name: string; duration?: string; fee?: string; }
interface UniOption { id: number; name: string; courses: CourseOption[]; }
interface CountryOption { id: number; name: string; code: string; universities: UniOption[]; }

function getFlag(code: string) {
    if (!code || code.length !== 2) return '';
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + 127397));
}

export default function NewApplicationPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [countries, setCountries] = useState<CountryOption[]>([]);
    const [counselors, setCounselors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
    const [selectedUni, setSelectedUni] = useState<UniOption | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);
    const [formData, setFormData] = useState({
        intake: '',
        counselor_id: '',
        notes: '',
    });
    const [availableIntakes, setAvailableIntakes] = useState<{ id: number; name: string; year: number }[]>([]);

    useEffect(() => {
        Promise.all([
            adminApi.getPublicCountries(),
            usersApi.getCounselors(),
            adminApi.getIntakes().catch(() => ({ data: { intakes: [] } })),
        ]).then(([cRes, coRes, iRes]) => {
            setCountries(cRes.data.countries || []);
            setCounselors(coRes.data.counselors || []);
            setAvailableIntakes(iRes.data.intakes || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const universities = selectedCountry?.universities || [];
    const courses = selectedUni?.courses || [];

    const handleSubmit = async () => {
        setCreating(true);
        setError('');
        try {
            await applicationsApi.create({
                country: selectedCountry?.name || '',
                university: selectedUni?.name || '',
                course: selectedCourse?.name || '',
                intake: formData.intake || undefined,
                counselor_id: user?.assigned_counselor_id || (formData.counselor_id ? parseInt(formData.counselor_id) : undefined),
                notes: formData.notes || undefined,
            });
            router.push('/client/applications');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            setError(e.response?.data?.error || 'Failed to create application');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Applications
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Application</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Choose your destination step by step</p>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-3 mb-8">
                {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 flex-1">
                        <button
                            onClick={() => { if (s.id < step) setStep(s.id); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                s.id === step
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : s.id < step
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 cursor-pointer'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                        >
                            <span>{s.id < step ? '\u2713' : s.icon}</span>
                            <span className="hidden md:inline">{s.title}</span>
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 rounded-full ${s.id < step ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Intake */}
            {step === 1 && (
                <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-4">When do you plan to start?</p>
                    {availableIntakes.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {availableIntakes.map((intake) => (
                                <button
                                    key={intake.id}
                                    type="button"
                                    onClick={() => { setFormData({...formData, intake: `${intake.name} ${intake.year}`}); setStep(2); }}
                                    className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 p-6 text-left group hover:shadow-lg hover:scale-[1.02] ${
                                        formData.intake === `${intake.name} ${intake.year}`
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                                            formData.intake === `${intake.name} ${intake.year}`
                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            📅
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{intake.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{intake.year}</p>
                                        </div>
                                    </div>
                                    {formData.intake === `${intake.name} ${intake.year}` && (
                                        <div className="absolute top-4 right-4">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">✓</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
                            <p className="text-slate-500 dark:text-slate-400">No specific intakes available. Please specify manually.</p>
                            <div className="max-w-md mx-auto mt-6">
                                <input type="text" value={formData.intake} onChange={e => setFormData({...formData, intake: e.target.value})}
                                    placeholder="e.g. September 2025"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                <button onClick={() => setStep(2)} disabled={!formData.intake}
                                    className="mt-4 w-full px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Select Country */}
            {step === 2 && (
                <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Where do you want to study?</p>
                    {countries.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {countries.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => { setSelectedCountry(c); setSelectedUni(null); setSelectedCourse(null); setStep(3); }}
                                    className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 p-6 text-left group hover:shadow-lg hover:scale-[1.02] ${
                                        selectedCountry?.id === c.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                                >
                                    {/* Flag background */}
                                    <span className="absolute right-2 bottom-0 text-[5rem] opacity-10 group-hover:opacity-20 transition-opacity leading-none select-none pointer-events-none">
                                        {getFlag(c.code)}
                                    </span>
                                    <div className="relative z-10">
                                        <span className="text-4xl block mb-3">{getFlag(c.code)}</span>
                                        <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.universities.length} universit{c.universities.length === 1 ? 'y' : 'ies'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                            <p className="text-slate-500 dark:text-slate-400">No countries available. Contact your admin.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Select University */}
            {step === 3 && (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{selectedCountry ? getFlag(selectedCountry.code) : ''}</span>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Universities in {selectedCountry?.name}</p>
                    </div>
                    {universities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {universities.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => { setSelectedUni(u); setSelectedCourse(null); setStep(4); }}
                                    className={`rounded-2xl border-2 transition-all duration-200 p-5 text-left hover:shadow-lg hover:scale-[1.01] ${
                                        selectedUni?.id === u.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-xl shrink-0">
                                            {'\ud83c\udfdb\ufe0f'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.courses.length} course{u.courses.length !== 1 ? 's' : ''} available</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                            <p className="text-slate-500 dark:text-slate-400">No universities found for {selectedCountry?.name}.</p>
                            <button onClick={() => setStep(2)} className="mt-4 text-blue-600 hover:underline text-sm">Choose another country</button>
                        </div>
                    )}
                </div>
            )}

            {/* Step 4: Select Course */}
            {step === 4 && (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">{'\ud83d\udcda'}</span>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Courses at {selectedUni?.name}</p>
                    </div>
                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => { setSelectedCourse(c); setStep(5); }}
                                    className={`rounded-2xl border-2 transition-all duration-200 p-5 text-left hover:shadow-lg hover:scale-[1.01] ${
                                        selectedCourse?.id === c.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                                    }`}
                                >
                                    <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                                    <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        {c.duration && <span>Duration: {c.duration}</span>}
                                        {c.fee && <span>Fee: {c.fee}</span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                            <p className="text-slate-500 dark:text-slate-400">No courses found for {selectedUni?.name}.</p>
                            <p className="text-sm text-slate-400 mt-2">You can still continue without a specific course.</p>
                            <button onClick={() => setStep(5)} className="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                                Skip &amp; Continue
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Step 5: Details */}
            {step === 5 && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
                    {/* Summary */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 mb-6">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Selection</p>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-slate-400">Country</p>
                                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                                    <span>{selectedCountry ? getFlag(selectedCountry.code) : ''}</span>
                                    {selectedCountry?.name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">University</p>
                                <p className="font-medium text-slate-900 dark:text-white mt-0.5">{selectedUni?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Course</p>
                                <p className="font-medium text-slate-900 dark:text-white mt-0.5">{selectedCourse?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mt-4">Intake</p>
                                <p className="font-medium text-slate-900 dark:text-white mt-0.5">{formData.intake || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Selected Intake</p>
                                <p className="font-semibold text-slate-900 dark:text-white text-lg">{formData.intake || '-'}</p>
                            </div>
                            <button onClick={() => setStep(1)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">Change</button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Counselor</label>
                            {(() => {
                                const assignedCounselor = counselors.find(c => c.id === user?.assigned_counselor_id);
                                return assignedCounselor ? (
                                    <div className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                                            {assignedCounselor.profile?.first_name?.[0] || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{assignedCounselor.profile?.first_name} {assignedCounselor.profile?.last_name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Your assigned counselor</p>
                                        </div>
                                        <svg className="w-4 h-4 ml-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                ) : (
                                    <select value={formData.counselor_id} onChange={e => setFormData({...formData, counselor_id: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                                        <option value="">No counselor assigned</option>
                                        {counselors.map((c) => (
                                            <option key={c.id} value={c.id}>{c.profile?.first_name} {c.profile?.last_name}</option>
                                        ))}
                                    </select>
                                );
                            })()}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Additional Notes</label>
                            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                                rows={3} placeholder="Any additional information..."
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">{error}</div>
                    )}

                    <div className="flex gap-3 mt-8">
                        <button onClick={() => router.push('/client/applications')}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={creating || !selectedCountry}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50">
                            {creating ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
                            ) : (
                                <>Create Application<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Step navigation for steps 2-4 */}
            {(step >= 2 && step <= 4) && (
                <div className="flex justify-between mt-6">
                    <button onClick={() => setStep(step - 1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back
                    </button>
                    {step === 4 && (
                        <button onClick={() => setStep(5)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                            Skip course selection
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
