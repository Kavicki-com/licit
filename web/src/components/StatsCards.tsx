import { FileSearch, CheckCircle, XCircle, Swords, DollarSign, TrendingUp } from 'lucide-react';
import type { DashboardStats } from '../types/licitacao';

interface StatsCardsProps {
    stats: DashboardStats | null;
    loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-surface-800/50 rounded-xl p-5 animate-pulse">
                        <div className="h-4 w-20 bg-surface-700 rounded mb-3" />
                        <div className="h-8 w-16 bg-surface-700 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: 'Total',
            value: stats.counts.total,
            icon: TrendingUp,
            color: 'text-primary-400',
            bg: 'bg-primary-500/10',
        },
        {
            label: 'Analisar',
            value: stats.counts.analisar,
            icon: FileSearch,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
        },
        {
            label: 'Aprovadas',
            value: stats.counts.aprovada,
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'Disputando',
            value: stats.counts.disputando,
            icon: Swords,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
        },
        {
            label: 'Descartadas',
            value: stats.counts.descartada,
            icon: XCircle,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
        },
        {
            label: 'Valor Estimado',
            value: formatCurrency(Number(stats.valorTotalEstimado)),
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            isWide: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="group relative overflow-hidden rounded-xl bg-surface-800/50 backdrop-blur-sm border border-surface-700/50 p-5 transition-all duration-300 hover:border-surface-600/70 hover:bg-surface-800/70"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-surface-400">{card.label}</p>
                            <p className={`text-2xl font-bold ${card.color}`}>
                                {typeof card.value === 'number' ? card.value.toLocaleString('pt-BR') : card.value}
                            </p>
                        </div>
                        <div className={`rounded-lg ${card.bg} p-2.5`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                    </div>
                    <div className={`absolute inset-x-0 bottom-0 h-0.5 ${card.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
            ))}
        </div>
    );
}

function formatCurrency(value: number): string {
    if (value >= 1_000_000) {
        return `R$ ${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `R$ ${(value / 1_000).toFixed(1)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
}
