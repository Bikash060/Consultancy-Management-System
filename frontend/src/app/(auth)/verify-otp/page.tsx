'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Card, Button } from '@/components/ui';

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [expiryTime, setExpiryTime] = useState(600); // 10 minutes in seconds
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('reset_email');
        if (!storedEmail) {
            router.replace('/forgot-password');
            return;
        }
        setEmail(storedEmail);
        setResendCooldown(60); // Initial cooldown after OTP was just sent

        // Focus first input
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, [router]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // OTP expiry timer
    useEffect(() => {
        if (expiryTime <= 0) return;
        const timer = setInterval(() => {
            setExpiryTime((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [expiryTime]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only last character
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 0) return;

        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
            newOtp[i] = pastedData[i] || '';
        }
        setOtp(newOtp);

        // Focus the next empty input or the last filled one
        const nextEmpty = newOtp.findIndex((v) => !v);
        const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = useCallback(async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await authApi.verifyOtp(email, otpString);
            // Store OTP for reset-password page
            sessionStorage.setItem('reset_otp', otpString);
            router.push('/reset-password');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [otp, email, router]);

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        const otpString = otp.join('');
        if (otpString.length === 6 && !loading) {
            handleVerify();
        }
    }, [otp, loading, handleVerify]);

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            await authApi.forgotPassword(email);
            setResendCooldown(60);
            setExpiryTime(600);
            setOtp(['', '', '', '', '', '']);
            setError('');
            inputRefs.current[0]?.focus();
        } catch {
            setError('Failed to resend OTP. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-xl shadow-blue-500/20">
                        <span className="text-2xl text-white">✉️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check Your Email</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Enter the 6-digit code sent to
                    </p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                        {email}
                    </p>
                </div>

                <Card className="shadow-xl">
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* OTP Input Boxes */}
                        <div className="flex justify-center gap-3" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`
                                        w-12 h-14 text-center text-xl font-bold
                                        bg-white dark:bg-slate-800
                                        border-2 rounded-xl
                                        text-slate-900 dark:text-white
                                        transition-all duration-200
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        hover:border-slate-400 dark:hover:border-slate-500
                                        ${digit ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600'}
                                        ${error ? 'border-red-400 dark:border-red-500 shake' : ''}
                                    `}
                                    aria-label={`OTP digit ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Expiry Timer */}
                        <div className="text-center">
                            {expiryTime > 0 ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className={`text-sm font-medium ${expiryTime < 60 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                        Code expires in {formatTime(expiryTime)}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                    OTP has expired. Please request a new one.
                                </p>
                            )}
                        </div>

                        {/* Verify Button */}
                        <Button
                            onClick={handleVerify}
                            loading={loading}
                            fullWidth
                            size="lg"
                            disabled={otp.join('').length !== 6 || expiryTime === 0}
                        >
                            Verify Code
                        </Button>

                        {/* Resend */}
                        <div className="text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Didn&apos;t receive the code?{' '}
                                {resendCooldown > 0 ? (
                                    <span className="text-slate-400 dark:text-slate-500">
                                        Resend in {resendCooldown}s
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleResend}
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </p>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
