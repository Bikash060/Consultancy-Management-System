'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helper?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Input({
    label,
    error,
    helper,
    leftIcon,
    rightIcon,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
                        w-full px-4 py-2.5 
                        ${leftIcon ? 'pl-10' : ''} 
                        ${rightIcon ? 'pr-10' : ''}
                        bg-white dark:bg-slate-800
                        border border-slate-300 dark:border-slate-600
                        rounded-xl
                        text-slate-900 dark:text-white
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        hover:border-slate-400 dark:hover:border-slate-500
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900
                        ${error ? 'border-red-500 focus:ring-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
            {helper && !error && (
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
            )}
        </div>
    );
}

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({
    label,
    error,
    className = '',
    id,
    rows = 3,
    ...props
}: TextareaProps) {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={textareaId}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                rows={rows}
                className={`
                    w-full px-4 py-2.5 
                    bg-white dark:bg-slate-800
                    border border-slate-300 dark:border-slate-600
                    rounded-xl
                    text-slate-900 dark:text-white
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    hover:border-slate-400 dark:hover:border-slate-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    resize-none
                    ${error ? 'border-red-500 focus:ring-red-500' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export function Select({
    label,
    error,
    options,
    className = '',
    id,
    ...props
}: SelectProps) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={`
                    w-full px-4 py-2.5 
                    bg-white dark:bg-slate-800
                    border border-slate-300 dark:border-slate-600
                    rounded-xl
                    text-slate-900 dark:text-white
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    hover:border-slate-400 dark:hover:border-slate-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer
                    ${error ? 'border-red-500 focus:ring-red-500' : ''}
                    ${className}
                `}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
