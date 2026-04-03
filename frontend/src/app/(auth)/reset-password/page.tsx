'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Card, Button, Input } from '@/components/ui';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const router = useRouter();

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('reset_email');
        const storedOtp = sessionStorage.getItem('reset_otp');
        if (!storedEmail || !storedOtp) {
            router.replace('/forgot-password');
            return;
        }
        setEmail(storedEmail);
        setOtp(storedOtp);
    }, [router]);

    // Password strength calculation
    const passwordChecks = useMemo(() => ({
        minLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
    }), [password]);

    const strengthScore = useMemo(() => {
        return Object.values(passwordChecks).filter(Boolean).length;
    }, [passwordChecks]);

    const strengthLabel = useMemo(() => {
        if (password.length === 0) return { text: '', color: '', bgColor: '' };
        if (strengthScore <= 1) return { text: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
        if (strengthScore <= 2) return { text: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-500' };
        if (strengthScore <= 3) return { text: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
        return { text: 'Strong', color: 'text-emerald-600', bgColor: 'bg-emerald-500' };
    }, [password.length, strengthScore]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (strengthScore < 4) {
            setError('Please meet all password requirements');
            return;
        }

        setLoading(true);

        try {
            await authApi.resetPassword(email, otp, password);
            setSuccess(true);
            // Clean up session storage
            sessionStorage.removeItem('reset_email');
            sessionStorage.removeItem('reset_otp');
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-xl shadow-emerald-500/20">
                        <span className="text-2xl text-white">🔑</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Set New Password</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Create a strong password for your account
                    </p>
                </div>

                <Card className="shadow-xl">
                    {success ? (
                        <div className="text-center py-6">
                            {/* Success Animation */}
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4 relative">
                                <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                {/* Pulse ring */}
                                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                Password Reset Successful!
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Your password has been changed. You can now sign in with your new password.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Redirecting to login...
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <Input
                                label="New Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                leftIcon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                            />

                            {/* Password Strength Bar */}
                            {password.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Password Strength</span>
                                        <span className={`text-xs font-semibold ${strengthLabel.color}`}>
                                            {strengthLabel.text}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${strengthLabel.bgColor} rounded-full transition-all duration-500 ease-out`}
                                            style={{ width: `${(strengthScore / 4) * 100}%` }}
                                        />
                                    </div>

                                    {/* Requirements Checklist */}
                                    <div className="grid grid-cols-2 gap-1.5 mt-3">
                                        {[
                                            { check: passwordChecks.minLength, label: '8+ characters' },
                                            { check: passwordChecks.hasUpper, label: 'Uppercase letter' },
                                            { check: passwordChecks.hasLower, label: 'Lowercase letter' },
                                            { check: passwordChecks.hasNumber, label: 'Number' },
                                        ].map((req, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                    req.check
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                                }`}>
                                                    {req.check ? (
                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                                    )}
                                                </div>
                                                <span className={`text-xs ${
                                                    req.check
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                                leftIcon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                }
                            />

                            <Button
                                type="submit"
                                loading={loading}
                                fullWidth
                                size="lg"
                                disabled={strengthScore < 4 || password !== confirmPassword || !password}
                            >
                                Reset Password
                            </Button>

                            <div className="text-center">
                                <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Sign In
                                </Link>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}
