import { Search, Filter, X } from 'lucide-react';
import type { StatusLicitacao } from '../types/licitacao';

interface FiltersBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: StatusLicitacao | '';
    onStatusFilterChange: (value: StatusLicitacao | '') => void;
    ufFilter: string;
    onUfFilterChange: (value: string) => void;
    modalidadeFilter: string[];
    onModalidadeFilterChange: (value: string[]) => void;
}

const STATUS_OPTIONS: { value: StatusLicitacao | ''; label: string }[] = [
    { value: '', label: 'Todos os Status' },
    { value: 'ANALISAR', label: 'Analisar' },
    { value: 'APROVADA', label: 'Aprovada' },
    { value: 'DISPUTANDO', label: 'Disputando' },
    { value: 'DESCARTADA', label: 'Descartada' },
];

const MODALIDADE_CHIPS = [
    { value: 'Pregão - Eletrônico', label: 'Pregão Eletrônico' },
    { value: 'Pregão - Presencial', label: 'Pregão Presencial' },
    { value: 'Concorrência - Eletrônica', label: 'Concorrência Eletrônica' },
    { value: 'Concorrência - Presencial', label: 'Concorrência Presencial' },
    { value: 'Dispensa de Licitação', label: 'Dispensa' },
    { value: 'Inexigibilidade', label: 'Inexigibilidade' },
    { value: 'Concurso', label: 'Concurso' },
    { value: 'Leilão - Eletrônico', label: 'Leilão Eletr.' },
    { value: 'Leilão - Presencial', label: 'Leilão Pres.' },
    { value: 'Diálogo Competitivo', label: 'Diálogo Comp.' },
    { value: 'Manifestação de Interesse', label: 'Manif. Interesse' },
    { value: 'Pré-qualificação', label: 'Pré-qualificação' },
    { value: 'Credenciamento', label: 'Credenciamento' },
];

const UF_OPTIONS = [
    '', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
];

export function FiltersBar({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    ufFilter,
    onUfFilterChange,
    modalidadeFilter,
    onModalidadeFilterChange,
}: FiltersBarProps) {
    const hasActiveFilters = search || statusFilter || ufFilter || modalidadeFilter.length > 0;

    function clearAll() {
        onSearchChange('');
        onStatusFilterChange('');
        onUfFilterChange('');
        onModalidadeFilterChange([]);
    }

    function toggleModalidade(value: string) {
        if (modalidadeFilter.includes(value)) {
            onModalidadeFilterChange(modalidadeFilter.filter((m) => m !== value));
        } else {
            onModalidadeFilterChange([...modalidadeFilter, value]);
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Row 1: Search + Status + UF + Clear */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar por objeto, órgão..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all"
                    />
                </div>

                {/* Status filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value as StatusLicitacao | '')}
                        className="appearance-none pl-10 pr-8 py-2.5 text-sm bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all cursor-pointer"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* UF filter */}
                <select
                    value={ufFilter}
                    onChange={(e) => onUfFilterChange(e.target.value)}
                    className="appearance-none px-4 py-2.5 text-sm bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all cursor-pointer"
                >
                    <option value="">Todos os UFs</option>
                    {UF_OPTIONS.filter(Boolean).map((uf) => (
                        <option key={uf} value={uf}>
                            {uf}
                        </option>
                    ))}
                </select>

                {/* Clear */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-surface-400 hover:text-surface-200 bg-surface-800/50 border border-surface-700/50 rounded-xl transition-colors cursor-pointer"
                    >
                        <X className="h-3.5 w-3.5" />
                        Limpar
                    </button>
                )}
            </div>

            {/* Row 2: Modalidade chips */}
            <div className="flex flex-wrap gap-2">
                {MODALIDADE_CHIPS.map((chip) => {
                    const isActive = modalidadeFilter.includes(chip.value);
                    return (
                        <button
                            key={chip.value}
                            onClick={() => toggleModalidade(chip.value)}
                            className={`
                                inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg
                                transition-all duration-150 cursor-pointer select-none
                                ${isActive
                                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40 shadow-sm shadow-primary-500/10'
                                    : 'bg-surface-800/40 text-surface-400 border border-surface-700/30 hover:bg-surface-800/70 hover:text-surface-300 hover:border-surface-600/50'
                                }
                            `}
                        >
                            {chip.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
