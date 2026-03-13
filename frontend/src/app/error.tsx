"use client";

import { useEffect } from "react";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log to error reporting service if available
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            {/* Background glow — red tint for error context */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/8 rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 text-center animate-fade-in max-w-lg w-full">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 bg-slate-800 border border-red-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/10">
                            <svg
                                className="w-12 h-12 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                        {/* Pulse ring */}
                        <div className="absolute inset-0 rounded-2xl border border-red-500/20 animate-ping opacity-50" />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-bold text-white mb-3">
                    Something went wrong
                </h1>
                <p className="text-slate-400 text-lg mb-4 leading-relaxed">
                    An unexpected error occurred. Our team has been notified and we&apos;re working to fix it.
                </p>

                {/* Error detail (dev-friendly, subtle) */}
                {error?.message && (
                    <div className="mb-8 mx-auto max-w-sm">
                        <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-left">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Error Details
                            </p>
                            <p className="text-sm text-red-400 font-mono break-all leading-relaxed">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-slate-600 mt-1">
                                    ID: {error.digest}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Try Again
                    </button>

                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        Go Home
                    </a>
                </div>

                {/* Support note */}
                <p className="mt-10 text-slate-600 text-sm">
                    If this problem persists, please contact{" "}
                    <span className="text-blue-500">support</span>.
                </p>
            </div>
        </div>
    );
}
