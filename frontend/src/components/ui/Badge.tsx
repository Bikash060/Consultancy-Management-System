'use client';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
    size?: 'sm' | 'md';
    dot?: boolean;
    className?: string;
}

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = '',
}: BadgeProps) {
    const variantClasses = {
        default: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
        success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        primary: 'bg-blue-600 text-white',
    };

    const dotClasses = {
        default: 'bg-slate-400',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        primary: 'bg-white',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                font-medium rounded-full
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                ${className}
            `}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]}`} />}
            {children}
        </span>
    );
}

// Status badge with predefined statuses
interface StatusBadgeProps {
    status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled' | 'active' | 'inactive' | 'verified';
    className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
        pending: { variant: 'warning', label: 'Pending' },
        approved: { variant: 'success', label: 'Approved' },
        verified: { variant: 'success', label: 'Verified' },
        rejected: { variant: 'error', label: 'Rejected' },
        in_progress: { variant: 'info', label: 'In Progress' },
        completed: { variant: 'success', label: 'Completed' },
        cancelled: { variant: 'error', label: 'Cancelled' },
        active: { variant: 'success', label: 'Active' },
        inactive: { variant: 'default', label: 'Inactive' },
    };

    const config = statusConfig[status] || { variant: 'default' as const, label: status };

    return (
        <Badge variant={config.variant} dot className={className}>
            {config.label}
        </Badge>
    );
}
