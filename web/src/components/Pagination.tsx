import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push('...');
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i);
        }
        if (page < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-surface-400">
                {total.toLocaleString('pt-BR')} licitação(ões) encontrada(s)
            </p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`dots-${i}`} className="px-2 text-surface-500">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${p === page
                                    ? 'bg-primary-600 text-white'
                                    : 'text-surface-400 hover:text-surface-100 hover:bg-surface-700/50'
                                }`}
                        >
                            {p}
                        </button>
                    ),
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
