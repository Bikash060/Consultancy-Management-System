'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { usersApi, adminApi } from '@/lib/api';
import type { User } from '@/types';

const STEPS = [
    { id: 1, title: 'Personal Details', icon: '\ud83d\udc64', desc: 'Tell us about yourself' },
    { id: 2, title: 'Parents / Guardian', icon: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67', desc: 'Family information' },
    { id: 3, title: 'Address', icon: '\ud83c\udfe0', desc: 'Where you live' },
    { id: 4, title: 'NEB Education', icon: '\ud83c\udf93', desc: 'Your +2 / NEB details' },
    { id: 5, title: 'Higher Education', icon: '\ud83d\udcda', desc: 'Bachelor\'s & English test' },
    { id: 6, title: 'Interests & Goals', icon: '\ud83c\udfaf', desc: 'Your aspirations' },
];

interface CourseOption { id: number; name: string; duration?: string; fee?: string; }
interface UniOption { id: number; name: string; courses: CourseOption[]; }
interface CountryOption {
    id: number; name: string; code: string;
    universities: UniOption[];
}

function getFlag(code: string) {
    if (!code || code.length !== 2) return '';
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + 127397));
}

export default function OnboardingPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [countries, setCountries] = useState<CountryOption[]>([]);
    const [counselors, setCounselors] = useState<User[]>([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        nationality: 'Nepali',
        marital_status: 'single',
        // Parents
        father_name: '',
        mother_name: '',
        parent_phone: '',
        parent_email: '',
        // Address
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country_of_residence: 'Nepal',
        // NEB
        neb_school: '',
        neb_stream: '',
        neb_year: '',
        neb_gpa: '',
        // Higher Ed
        bachelors_university: '',
        bachelors_course: '',
        bachelors_gpa: '',
        english_test_type: '',
        english_test_score: '',
        // Interests
        interests: '',
        career_goals: '',
        preferred_country: '',
        preferred_course: '',
        budget: '',
        counselor_id: '',
    });

    useEffect(() => {
        if (user?.profile_setup) {
            router.replace('/client');
        }
    }, [user, router]);

    useEffect(() => {
        adminApi.getPublicCountries().then(res => setCountries(res.data.countries || [])).catch(() => {});
        usersApi.getCounselors().then(res => setCounselors(res.data.counselors || [])).catch(() => {});
    }, []);

    const set = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

    const canGoNext = () => {
        switch (step) {
            case 1: return formData.first_name && formData.last_name && formData.gender;
            case 2: return formData.father_name || formData.mother_name;
            case 3: return formData.city && formData.country_of_residence;
            case 4: return formData.neb_school && formData.neb_stream;
            case 6: return !!formData.counselor_id;
            default: return true;
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        try {
            await usersApi.completeOnboarding(formData);
            await refreshUser();
            router.replace('/client');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            setError(e.response?.data?.error || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const selectClasses = 'w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all';
    const inputClasses = selectClasses;
    const labelClasses = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            {/* Top bar */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Welcome aboard!</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Complete your profile to get started</p>
                    </div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Step {step} of {STEPS.length}</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Step indicators */}
                <div className="flex items-center justify-between mb-10">
                    {STEPS.map((s) => (
                        <div key={s.id} className="flex flex-col items-center flex-1">
                            <button
                                onClick={() => s.id < step && setStep(s.id)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${
                                    s.id === step
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                                        : s.id < step
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 cursor-pointer hover:scale-105'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}
                            >
                                {s.id < step ? '\u2713' : s.icon}
                            </button>
                            <span className={`text-xs mt-2 font-medium hidden md:block ${
                                s.id === step ? 'text-blue-600 dark:text-blue-400' : s.id < step ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>

                {/* Form card */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{STEPS[step - 1].title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{STEPS[step - 1].desc}</p>
                    </div>

                    {/* Step 1: Personal Details */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClasses}>First Name <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.first_name} onChange={e => set('first_name', e.target.value)} placeholder="John" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Last Name <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Doe" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Phone</label>
                                <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)} placeholder="+977-9800000000" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Gender <span className="text-red-500">*</span></label>
                                <select value={formData.gender} onChange={e => set('gender', e.target.value)} className={selectClasses}>
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Date of Birth</label>
                                <input type="date" value={formData.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Nationality</label>
                                <input type="text" value={formData.nationality} onChange={e => set('nationality', e.target.value)} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Marital Status</label>
                                <select value={formData.marital_status} onChange={e => set('marital_status', e.target.value)} className={selectClasses}>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Parents / Guardian */}
                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClasses}>Father&apos;s Full Name</label>
                                <input type="text" value={formData.father_name} onChange={e => set('father_name', e.target.value)} placeholder="Ram Bahadur" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Mother&apos;s Full Name</label>
                                <input type="text" value={formData.mother_name} onChange={e => set('mother_name', e.target.value)} placeholder="Sita Devi" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Parent/Guardian Phone</label>
                                <input type="tel" value={formData.parent_phone} onChange={e => set('parent_phone', e.target.value)} placeholder="+977-9800000000" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Parent/Guardian Email</label>
                                <input type="email" value={formData.parent_email} onChange={e => set('parent_email', e.target.value)} placeholder="parent@email.com" className={inputClasses} />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Address */}
                    {step === 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Street Address</label>
                                <input type="text" value={formData.address} onChange={e => set('address', e.target.value)} placeholder="Street, Ward, Tole" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>City <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.city} onChange={e => set('city', e.target.value)} placeholder="Kathmandu" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>State / Province</label>
                                <input type="text" value={formData.state} onChange={e => set('state', e.target.value)} placeholder="Bagmati" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>ZIP / Postal Code</label>
                                <input type="text" value={formData.zip_code} onChange={e => set('zip_code', e.target.value)} placeholder="44600" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Country of Residence <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.country_of_residence} onChange={e => set('country_of_residence', e.target.value)} className={inputClasses} />
                            </div>
                        </div>
                    )}

                    {/* Step 4: NEB Education */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                                Enter your +2 / NEB (National Examination Board) details below.
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>School / College Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.neb_school} onChange={e => set('neb_school', e.target.value)} placeholder="e.g. Xavier International College" className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Stream / Faculty <span className="text-red-500">*</span></label>
                                    <select value={formData.neb_stream} onChange={e => set('neb_stream', e.target.value)} className={selectClasses}>
                                        <option value="">Select stream</option>
                                        <option value="Science">Science</option>
                                        <option value="Management">Management</option>
                                        <option value="Humanities">Humanities</option>
                                        <option value="Education">Education</option>
                                        <option value="Law">Law</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Completion Year</label>
                                    <input type="text" value={formData.neb_year} onChange={e => set('neb_year', e.target.value)} placeholder="e.g. 2023" className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>GPA / Percentage</label>
                                    <input type="text" value={formData.neb_gpa} onChange={e => set('neb_gpa', e.target.value)} placeholder="e.g. 3.5 or 85%" className={inputClasses} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Higher Education & English Test */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Bachelor&apos;s Degree (if applicable)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClasses}>University</label>
                                        <input type="text" value={formData.bachelors_university} onChange={e => set('bachelors_university', e.target.value)} placeholder="e.g. Tribhuvan University" className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Course / Program</label>
                                        <input type="text" value={formData.bachelors_course} onChange={e => set('bachelors_course', e.target.value)} placeholder="e.g. BBA, BIT, BSc CSIT" className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>GPA / Percentage</label>
                                        <input type="text" value={formData.bachelors_gpa} onChange={e => set('bachelors_gpa', e.target.value)} placeholder="e.g. 3.2 or 78%" className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                            <hr className="border-slate-200 dark:border-slate-700" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">English Proficiency Test</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClasses}>Test Type</label>
                                        <select value={formData.english_test_type} onChange={e => set('english_test_type', e.target.value)} className={selectClasses}>
                                            <option value="">Select test</option>
                                            <option value="IELTS">IELTS</option>
                                            <option value="TOEFL">TOEFL</option>
                                            <option value="PTE">PTE Academic</option>
                                            <option value="Duolingo">Duolingo English Test</option>
                                            <option value="none">Not taken yet</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Score</label>
                                        <input type="text" value={formData.english_test_score} onChange={e => set('english_test_score', e.target.value)} placeholder="e.g. 6.5 / 90 / 65" className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Interests & Goals */}
                    {step === 6 && (
                        <div className="space-y-5">
                            <div>
                                <label className={labelClasses}>Preferred Country</label>
                                <select value={formData.preferred_country} onChange={e => set('preferred_country', e.target.value)} className={selectClasses}>
                                    <option value="">Select preferred country</option>
                                    {countries.map(c => (
                                        <option key={c.id} value={c.name}>{getFlag(c.code)} {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Preferred Course / Field</label>
                                <input type="text" value={formData.preferred_course} onChange={e => set('preferred_course', e.target.value)} placeholder="e.g. Computer Science, Business, Nursing" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Interests & Hobbies</label>
                                <textarea value={formData.interests} onChange={e => set('interests', e.target.value)} rows={2} placeholder="Technology, Research, Sports..." className={inputClasses + ' resize-none'} />
                            </div>
                            <div>
                                <label className={labelClasses}>Career Goals</label>
                                <textarea value={formData.career_goals} onChange={e => set('career_goals', e.target.value)} rows={2} placeholder="What do you want to achieve after studying abroad?" className={inputClasses + ' resize-none'} />
                            </div>
                            <div>
                                <label className={labelClasses}>Estimated Budget (NPR/USD)</label>
                                <input type="text" value={formData.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 30,00,000 NPR or $25,000" className={inputClasses} />
                            </div>

                            {/* Counselor Selection — Required */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <label className={labelClasses}>Select Your Counselor <span className="text-red-500">*</span></label>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Choose a counselor who will guide you through the entire process. This cannot be changed later.</p>
                                {counselors.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
                                        No counselors are available at this time. Please contact support.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {counselors.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => set('counselor_id', String(c.id))}
                                                className={`rounded-xl border-2 transition-all duration-200 p-4 text-left hover:shadow-md ${
                                                    formData.counselor_id === String(c.id)
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                                                        formData.counselor_id === String(c.id)
                                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                                    }`}>
                                                        {c.profile?.first_name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                                            {c.profile?.first_name} {c.profile?.last_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.email}</p>
                                                    </div>
                                                    {formData.counselor_id === String(c.id) && (
                                                        <span className="ml-auto text-blue-600 dark:text-blue-400 text-lg">✓</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {!formData.counselor_id && counselors.length > 0 && (
                                    <p className="text-xs text-red-500 mt-2">Please select a counselor to continue.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setStep(step - 1)}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Back
                        </button>

                        {step < STEPS.length ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!canGoNext()}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Complete Setup
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
