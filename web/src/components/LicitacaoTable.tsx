import { useState } from 'react';
import {
    ExternalLink,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    Swords,
    FileSearch,
    FileText,
    MapPin,
    Building2,
    Calendar,
} from 'lucide-react';
import type { Licitacao, StatusLicitacao } from '../types/licitacao';
import { StatusBadge } from './StatusBadge';
import { updateStatus } from '../services/api';
import { EditalModal } from './EditalModal';

interface LicitacaoTableProps {
    licitacoes: Licitacao[];
    loading: boolean;
    onStatusChange: () => void;
}

export function LicitacaoTable({ licitacoes, loading, onStatusChange }: LicitacaoTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editalLicitacao, setEditalLicitacao] = useState<Licitacao | null>(null);

    async function handleStatusChange(id: string, newStatus: StatusLicitacao) {
        setUpdatingId(id);
        try {
            await updateStatus(id, newStatus);
            onStatusChange();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdatingId(null);
        }
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-surface-800/50 rounded-xl p-5 animate-pulse">
                        <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-3/4 bg-surface-700 rounded" />
                                <div className="h-4 w-1/2 bg-surface-700 rounded" />
                            </div>
                            <div className="h-6 w-20 bg-surface-700 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (licitacoes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-surface-400">
                <FileSearch className="h-16 w-16 mb-4 opacity-40" />
                <p className="text-lg font-medium">Nenhuma licitação encontrada</p>
                <p className="text-sm mt-1">Tente alterar os filtros ou sincronize com o PNCP</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {licitacoes.map((lic) => {
                const isExpanded = expandedId === lic.id;
                const isUpdating = updatingId === lic.id;

                return (
                    <div
                        key={lic.id}
                        className={`rounded-xl border transition-all duration-200 ${isExpanded
                            ? 'bg-surface-800/70 border-primary-500/30 shadow-lg shadow-primary-500/5'
                            : 'bg-surface-800/40 border-surface-700/40 hover:border-surface-600/60'
                            }`}
                    >
                        {/* Main row */}
                        <div
                            className="flex items-start gap-4 p-5 cursor-pointer"
                            onClick={() => setExpandedId(isExpanded ? null : lic.id)}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-2">
                                    <StatusBadge status={lic.status} />
                                    {lic.modalidadeNome && (
                                        <span className="text-xs text-surface-500 bg-surface-700/50 px-2 py-0.5 rounded-full">
                                            {lic.modalidadeNome}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-sm font-semibold text-surface-100 leading-snug line-clamp-2 mb-2">
                                    {lic.objetoCompra}
                                </h3>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-400">
                                    <span className="flex items-center gap-1">
                                        <Building2 className="h-3.5 w-3.5" />
                                        {lic.orgaoRazaoSocial}
                                    </span>
                                    {lic.unidadeUf && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {lic.unidadeMunicipio ? `${lic.unidadeMunicipio}/${lic.unidadeUf}` : lic.unidadeUf}
                                        </span>
                                    )}
                                    {lic.dataAberturaProposta && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Abertura: {new Date(lic.dataAberturaProposta).toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {lic.valorTotalEstimado && (
                                    <p className="text-sm font-bold text-emerald-400">
                                        {Number(lic.valorTotalEstimado).toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        })}
                                    </p>
                                )}
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-surface-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-surface-400" />
                                )}
                            </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                            <div className="px-5 pb-5 border-t border-surface-700/50">
                                <div className="pt-4 space-y-4">
                                    {/* Info complementar */}
                                    {lic.informacaoComplementar && (
                                        <div>
                                            <p className="text-xs font-medium text-surface-400 mb-1">Informação Complementar</p>
                                            <p className="text-sm text-surface-300 leading-relaxed">{lic.informacaoComplementar}</p>
                                        </div>
                                    )}

                                    {/* Details grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <DetailItem label="Nº Compra" value={lic.numeroCompra} />
                                        <DetailItem label="Processo" value={lic.processo} />
                                        <DetailItem label="Modo Disputa" value={lic.modoDisputaNome} />
                                        <DetailItem label="Situação" value={lic.situacaoCompraNome} />
                                        <DetailItem label="Publicação PNCP" value={lic.dataPublicacaoPncp ? new Date(lic.dataPublicacaoPncp).toLocaleDateString('pt-BR') : null} />
                                        <DetailItem
                                            label="Encerramento"
                                            value={lic.dataEncerramentoProposta ? new Date(lic.dataEncerramentoProposta).toLocaleDateString('pt-BR') : null}
                                        />
                                        <DetailItem label="SRP" value={lic.srp ? 'Sim' : 'Não'} />
                                        <DetailItem label="CNPJ Órgão" value={lic.orgaoCnpj} />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center gap-2 pt-2">
                                        <ActionButton
                                            label="Aprovar"
                                            icon={CheckCircle}
                                            variant="success"
                                            disabled={isUpdating || lic.status === 'APROVADA'}
                                            onClick={() => handleStatusChange(lic.id, 'APROVADA')}
                                        />
                                        <ActionButton
                                            label="Disputar"
                                            icon={Swords}
                                            variant="primary"
                                            disabled={isUpdating || lic.status === 'DISPUTANDO'}
                                            onClick={() => handleStatusChange(lic.id, 'DISPUTANDO')}
                                        />
                                        <ActionButton
                                            label="Descartar"
                                            icon={XCircle}
                                            variant="danger"
                                            disabled={isUpdating || lic.status === 'DESCARTADA'}
                                            onClick={() => handleStatusChange(lic.id, 'DESCARTADA')}
                                        />
                                        <ActionButton
                                            label="Analisar"
                                            icon={FileSearch}
                                            variant="warning"
                                            disabled={isUpdating || lic.status === 'ANALISAR'}
                                            onClick={() => handleStatusChange(lic.id, 'ANALISAR')}
                                        />

                                        <div className="h-6 w-px bg-surface-700 mx-1" />

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditalLicitacao(lic); }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <FileText className="h-3.5 w-3.5" />
                                            Ver Edital Completo
                                        </button>

                                        {lic.linkSistemaOrigem && (
                                            <a
                                                href={lic.linkSistemaOrigem}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Sistema Origem
                                            </a>
                                        )}
                                        {lic.linkProcessoEletronico && (
                                            <a
                                                href={lic.linkProcessoEletronico}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-info bg-info/10 hover:bg-info/20 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Processo Eletrônico
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            {editalLicitacao && (
                <EditalModal
                    licitacao={editalLicitacao}
                    onClose={() => setEditalLicitacao(null)}
                />
            )}
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-xs font-medium text-surface-500">{label}</p>
            <p className="text-sm text-surface-200 mt-0.5">{value || '—'}</p>
        </div>
    );
}

interface ActionButtonProps {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: 'success' | 'danger' | 'primary' | 'warning';
    disabled: boolean;
    onClick: () => void;
}

const VARIANT_CLASSES = {
    success: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40',
    danger: 'text-red-400 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40',
    primary: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-40',
    warning: 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40',
};

function ActionButton({ label, icon: Icon, variant, disabled, onClick }: ActionButtonProps) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    );
}
