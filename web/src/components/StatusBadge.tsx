import type { StatusLicitacao } from '../types/licitacao';

const STATUS_CONFIG: Record<StatusLicitacao, { label: string; classes: string }> = {
    ANALISAR: {
        label: 'Analisar',
        classes: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
    },
    APROVADA: {
        label: 'Aprovada',
        classes: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
    },
    DESCARTADA: {
        label: 'Descartada',
        classes: 'bg-red-500/15 text-red-400 ring-red-500/30',
    },
    DISPUTANDO: {
        label: 'Disputando',
        classes: 'bg-blue-500/15 text-blue-400 ring-blue-500/30',
    },
};

interface StatusBadgeProps {
    status: StatusLicitacao;
    size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${config.classes} ${sizeClasses}`}>
            {config.label}
        </span>
    );
}
