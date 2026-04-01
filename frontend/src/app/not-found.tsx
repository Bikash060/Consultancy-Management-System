'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center animate-fade-in">
        {/* 404 Number */}
        <div className="relative inline-block mb-6">
          <span className="text-[10rem] font-black leading-none bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent select-none">
            404
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 blur-2xl rounded-full -z-10" />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-lg mb-2 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <p className="text-slate-500 text-sm mb-10">
          Please check the URL or navigate back to safety.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Decorative dots */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`rounded-full ${i === 2 ? "w-3 h-3 bg-blue-500" : "w-2 h-2 bg-slate-700"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
