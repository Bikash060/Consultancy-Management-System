'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { usersApi } from '@/lib/api';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        nationality: '',
        marital_status: '',
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
        country_of_residence: '',
        // Education
        passport_number: '',
        education_background: '',
        neb_school: '',
        neb_stream: '',
        neb_year: '',
        neb_gpa: '',
        bachelors_university: '',
        bachelors_course: '',
        bachelors_gpa: '',
        english_test_type: '',
        english_test_score: '',
        // Goals
        preferred_country: '',
        preferred_course: '',
        interests: '',
        career_goals: '',
        budget: '',
    });

    useEffect(() => {
        if (user?.profile) {
            const p = user.profile as Record<string, unknown>;
            setFormData({
                first_name: (p.first_name as string) || '',
                last_name: (p.last_name as string) || '',
                phone: user.phone || '',
                gender: (p.gender as string) || '',
                date_of_birth: (p.date_of_birth as string) || '',
                nationality: (p.nationality as string) || '',
                marital_status: (p.marital_status as string) || '',
                father_name: (p.father_name as string) || '',
                mother_name: (p.mother_name as string) || '',
                parent_phone: (p.parent_phone as string) || '',
                parent_email: (p.parent_email as string) || '',
                address: (p.address as string) || '',
                city: (p.city as string) || '',
                state: (p.state as string) || '',
                zip_code: (p.zip_code as string) || '',
                country_of_residence: (p.country_of_residence as string) || '',
                passport_number: (p.passport_number as string) || '',
                education_background: (p.education_background as string) || '',
                neb_school: (p.neb_school as string) || '',
                neb_stream: (p.neb_stream as string) || '',
                neb_year: (p.neb_year as string) || '',
                neb_gpa: (p.neb_gpa as string) || '',
                bachelors_university: (p.bachelors_university as string) || '',
                bachelors_course: (p.bachelors_course as string) || '',
                bachelors_gpa: (p.bachelors_gpa as string) || '',
                english_test_type: (p.english_test_type as string) || '',
                english_test_score: (p.english_test_score as string) || '',
                preferred_country: (p.preferred_country as string) || '',
                preferred_course: (p.preferred_course as string) || '',
                interests: (p.interests as string) || '',
                career_goals: (p.career_goals as string) || '',
                budget: p.budget != null ? String(p.budget) : '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await usersApi.updateProfile(formData);
            await refreshUser();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'personal', label: 'Personal', icon: '👤' },
        { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
        { id: 'address', label: 'Address', icon: '🏠' },
        { id: 'education', label: 'Education', icon: '🎓' },
        { id: 'goals', label: 'Goals', icon: '🎯' },
    ];

    const inputClasses = 'w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all';
    const labelClasses = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
    const selectClasses = inputClasses;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage all your personal information</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                            activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {success && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            ✓ Profile updated successfully!
                        </div>
                    )}

                    {/* Personal Details */}
                    {activeTab === 'personal' && (
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>First Name</label>
                                    <input name="first_name" value={formData.first_name} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Last Name</label>
                                    <input name="last_name" value={formData.last_name} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Phone</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className={selectClasses}>
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Date of Birth</label>
                                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Nationality</label>
                                    <input name="nationality" value={formData.nationality} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Marital Status</label>
                                    <select name="marital_status" value={formData.marital_status} onChange={handleChange} className={selectClasses}>
                                        <option value="">Select</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="divorced">Divorced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Passport Number</label>
                                    <input name="passport_number" value={formData.passport_number} onChange={handleChange} className={inputClasses} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Family */}
                    {activeTab === 'family' && (
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Family / Guardian</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>Father&apos;s Name</label>
                                    <input name="father_name" value={formData.father_name} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Mother&apos;s Name</label>
                                    <input name="mother_name" value={formData.mother_name} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Parent/Guardian Phone</label>
                                    <input name="parent_phone" value={formData.parent_phone} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Parent/Guardian Email</label>
                                    <input name="parent_email" value={formData.parent_email} onChange={handleChange} className={inputClasses} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {activeTab === 'address' && (
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Street Address</label>
                                    <input name="address" value={formData.address} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>City</label>
                                    <input name="city" value={formData.city} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>State / Province</label>
                                    <input name="state" value={formData.state} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>ZIP / Postal Code</label>
                                    <input name="zip_code" value={formData.zip_code} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Country of Residence</label>
                                    <input name="country_of_residence" value={formData.country_of_residence} onChange={handleChange} className={inputClasses} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {activeTab === 'education' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">NEB / +2 Education</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>School / College</label>
                                        <input name="neb_school" value={formData.neb_school} onChange={handleChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Stream / Faculty</label>
                                        <select name="neb_stream" value={formData.neb_stream} onChange={handleChange} className={selectClasses}>
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
                                        <input name="neb_year" value={formData.neb_year} onChange={handleChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>GPA / Percentage</label>
                                        <input name="neb_gpa" value={formData.neb_gpa} onChange={handleChange} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                            <hr className="border-slate-200 dark:border-slate-700" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Bachelor&apos;s Degree</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClasses}>University</label>
                                        <input name="bachelors_university" value={formData.bachelors_university} onChange={handleChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Course / Program</label>
                                        <input name="bachelors_course" value={formData.bachelors_course} onChange={handleChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>GPA / Percentage</label>
                                        <input name="bachelors_gpa" value={formData.bachelors_gpa} onChange={handleChange} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                            <hr className="border-slate-200 dark:border-slate-700" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">English Proficiency</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClasses}>Test Type</label>
                                        <select name="english_test_type" value={formData.english_test_type} onChange={handleChange} className={selectClasses}>
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
                                        <input name="english_test_score" value={formData.english_test_score} onChange={handleChange} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                            <hr className="border-slate-200 dark:border-slate-700" />
                            <div>
                                <label className={labelClasses}>Education Background (Summary)</label>
                                <textarea
                                    name="education_background"
                                    value={formData.education_background}
                                    onChange={handleChange}
                                    className={inputClasses + ' resize-none'}
                                    rows={3}
                                    placeholder="Describe your educational qualifications..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Goals */}
                    {activeTab === 'goals' && (
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Interests & Goals</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>Preferred Country</label>
                                    <input name="preferred_country" value={formData.preferred_country} onChange={handleChange} placeholder="e.g., Canada, UK, Australia" className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Preferred Course</label>
                                    <input name="preferred_course" value={formData.preferred_course} onChange={handleChange} placeholder="e.g., Computer Science, MBA" className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Budget</label>
                                    <input name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g., 30000" className={inputClasses} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Interests & Hobbies</label>
                                <textarea name="interests" value={formData.interests} onChange={handleChange} rows={2} placeholder="Technology, Research, Sports..." className={inputClasses + ' resize-none'} />
                            </div>
                            <div>
                                <label className={labelClasses}>Career Goals</label>
                                <textarea name="career_goals" value={formData.career_goals} onChange={handleChange} rows={2} placeholder="What do you want to achieve after studying abroad?" className={inputClasses + ' resize-none'} />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button type="submit" loading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
