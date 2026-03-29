import { useState, useEffect } from 'react';
import {
    X,
    FileText,
    Download,
    ExternalLink,
    Building2,
    MapPin,
    Calendar,
    DollarSign,
    Loader2,
    AlertCircle,
    FileDown,
    Globe,
    BookOpen,
} from 'lucide-react';
import type { Licitacao } from '../types/licitacao';
import { fetchEdital, type EditalArquivo, type EditalResponse } from '../services/api';
import { StatusBadge } from './StatusBadge';

interface EditalModalProps {
    licitacao: Licitacao;
    onClose: () => void;
}

export function EditalModal({ licitacao, onClose }: EditalModalProps) {
    const [data, setData] = useState<EditalResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchEdital(licitacao.id);
                if (!cancelled) setData(result);
            } catch (err: any) {
                if (!cancelled) setError(err.response?.data?.error || 'Erro ao carregar edital');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [licitacao.id]);

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const detalhes = data?.detalhes;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8" onClick={onClose}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-4xl max-h-[calc(100vh-4rem)] rounded-2xl bg-surface-900 border border-surface-700/60 shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-6 border-b border-surface-700/50 shrink-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <StatusBadge status={licitacao.status} size="md" />
                            {licitacao.modalidadeNome && (
                                <span className="text-xs text-surface-400 bg-surface-800 px-2.5 py-1 rounded-full">
                                    {licitacao.modalidadeNome}
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-surface-100 leading-snug">{licitacao.objetoCompra}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors cursor-pointer shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 text-surface-400">
                            <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary-500" />
                            <p className="text-sm">Buscando edital no PNCP...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* Quick Info Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <InfoCard
                                    icon={Building2}
                                    label="Órgão"
                                    value={licitacao.orgaoRazaoSocial}
                                />
                                <InfoCard
                                    icon={MapPin}
                                    label="Local"
                                    value={
                                        licitacao.unidadeMunicipio && licitacao.unidadeUf
                                            ? `${licitacao.unidadeMunicipio}/${licitacao.unidadeUf}`
                                            : licitacao.unidadeUf || '—'
                                    }
                                />
                                <InfoCard
                                    icon={Calendar}
                                    label="Abertura"
                                    value={
                                        licitacao.dataAberturaProposta
                                            ? new Date(licitacao.dataAberturaProposta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : '—'
                                    }
                                />
                                <InfoCard
                                    icon={DollarSign}
                                    label="Valor Estimado"
                                    value={
                                        licitacao.valorTotalEstimado
                                            ? Number(licitacao.valorTotalEstimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                            : '—'
                                    }
                                    highlight
                                />
                            </div>

                            {/* Full Object */}
                            <Section title="Objeto da Contratação">
                                <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">
                                    {detalhes?.objetoCompra || licitacao.objetoCompra}
                                </p>
                            </Section>

                            {/* Complementary Info */}
                            {(detalhes?.informacaoComplementar || licitacao.informacaoComplementar) && (
                                <Section title="Informação Complementar">
                                    <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">
                                        {detalhes?.informacaoComplementar || licitacao.informacaoComplementar}
                                    </p>
                                </Section>
                            )}

                            {/* Detailed Information */}
                            <Section title="Detalhes da Contratação">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                    <DetailRow label="Nº Controle PNCP" value={licitacao.numeroControlePNCP} />
                                    <DetailRow label="Nº Compra" value={licitacao.numeroCompra} />
                                    <DetailRow label="Processo" value={licitacao.processo || detalhes?.processo} />
                                    <DetailRow label="CNPJ Órgão" value={formatCnpj(licitacao.orgaoCnpj)} />
                                    <DetailRow label="Unidade" value={licitacao.unidadeNome} />
                                    <DetailRow label="Modalidade" value={detalhes?.modalidadeNome || licitacao.modalidadeNome} />
                                    <DetailRow label="Modo de Disputa" value={detalhes?.modoDisputaNome || licitacao.modoDisputaNome} />
                                    <DetailRow label="Situação" value={detalhes?.situacaoCompraNome || licitacao.situacaoCompraNome} />
                                    <DetailRow label="SRP" value={licitacao.srp ? 'Sim' : 'Não'} />
                                    <DetailRow
                                        label="Publicação PNCP"
                                        value={new Date(licitacao.dataPublicacaoPncp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    />
                                    <DetailRow
                                        label="Encerramento Propostas"
                                        value={
                                            licitacao.dataEncerramentoProposta
                                                ? new Date(licitacao.dataEncerramentoProposta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : null
                                        }
                                    />
                                    {detalhes?.valorTotalHomologado != null && (
                                        <DetailRow
                                            label="Valor Homologado"
                                            value={Number(detalhes.valorTotalHomologado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        />
                                    )}
                                </div>
                            </Section>

                            {/* Amparo Legal */}
                            {detalhes?.amparoLegal && (
                                <Section title="Amparo Legal">
                                    <p className="text-sm text-surface-300">
                                        <span className="font-medium text-surface-200">{detalhes.amparoLegal.nome}</span>
                                        {detalhes.amparoLegal.descricao && <> — {detalhes.amparoLegal.descricao}</>}
                                    </p>
                                </Section>
                            )}

                            {/* Termos de Referência — highlighted */}
                            {data?.termosDeReferencia && data.termosDeReferencia.length > 0 && (
                                <Section title="📋 Termos de Referência">
                                    <div className="space-y-2">
                                        {data.termosDeReferencia.map((arq: EditalArquivo, index: number) => (
                                            <a
                                                key={index}
                                                href={arq.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl hover:border-amber-400/40 hover:bg-amber-500/10 transition-all group"
                                            >
                                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/15 shrink-0">
                                                    <BookOpen className="h-5 w-5 text-amber-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-surface-200 truncate group-hover:text-amber-400 transition-colors">
                                                        {arq.titulo || `Termo de Referência ${index + 1}`}
                                                    </p>
                                                    <p className="text-xs text-surface-500">
                                                        {arq.tipoDocumentoNome || 'Termo de Referência'}
                                                        {arq.dataPublicacao && ` • ${new Date(arq.dataPublicacao).toLocaleDateString('pt-BR')}`}
                                                    </p>
                                                </div>
                                                <Download className="h-4 w-4 text-amber-500/60 group-hover:text-amber-400 transition-colors shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Itens da Contratação */}
                            {data?.itens && data.itens.length > 0 && (
                                <Section title="Itens da Contratação">
                                    <div className="rounded-xl border border-surface-700/40 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-surface-800/60 text-surface-400 text-xs">
                                                    <th className="text-left px-3 py-2.5 font-medium w-12">#</th>
                                                    <th className="text-left px-3 py-2.5 font-medium">Descrição</th>
                                                    <th className="text-right px-3 py-2.5 font-medium w-20">Qtd</th>
                                                    <th className="text-right px-3 py-2.5 font-medium w-28">Valor Unit.</th>
                                                    <th className="text-right px-3 py-2.5 font-medium w-28">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.itens.map((item: any, i: number) => (
                                                    <tr key={i} className="border-t border-surface-700/30 hover:bg-surface-800/30 transition-colors">
                                                        <td className="px-3 py-2.5 text-surface-500 tabular-nums">{item.numeroItem || i + 1}</td>
                                                        <td className="px-3 py-2.5 text-surface-200">
                                                            <p className="line-clamp-2">{item.descricao || '—'}</p>
                                                            {item.materialOuServicoNome && (
                                                                <span className="text-xs text-surface-500">{item.materialOuServicoNome}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right text-surface-300 tabular-nums whitespace-nowrap">
                                                            {item.quantidade != null ? Number(item.quantidade).toLocaleString('pt-BR') : '—'}
                                                            {item.unidadeMedida && <span className="text-xs text-surface-500 ml-1">{item.unidadeMedida}</span>}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right text-surface-300 tabular-nums">
                                                            {item.valorUnitarioEstimado != null
                                                                ? Number(item.valorUnitarioEstimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                                : '—'}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right text-emerald-400 font-medium tabular-nums">
                                                            {item.valorTotal != null
                                                                ? Number(item.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                                : '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Section>
                            )}

                            {/* Outros Documentos */}
                            {data?.outrosDocumentos && data.outrosDocumentos.length > 0 && (
                                <Section title="Outros Documentos do Edital">
                                    <div className="space-y-2">
                                        {data.outrosDocumentos.map((arq: EditalArquivo, index: number) => (
                                            <a
                                                key={index}
                                                href={arq.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-surface-800/50 border border-surface-700/40 rounded-xl hover:border-primary-500/30 hover:bg-surface-800/70 transition-all group"
                                            >
                                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/10 shrink-0">
                                                    <FileDown className="h-5 w-5 text-primary-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-surface-200 truncate group-hover:text-primary-400 transition-colors">
                                                        {arq.titulo || `Documento ${index + 1}`}
                                                    </p>
                                                    {arq.tipoDocumentoNome && (
                                                        <p className="text-xs text-surface-500">
                                                            {arq.tipoDocumentoNome}
                                                            {arq.dataPublicacao && ` • ${new Date(arq.dataPublicacao).toLocaleDateString('pt-BR')}`}
                                                        </p>
                                                    )}
                                                </div>
                                                <Download className="h-4 w-4 text-surface-500 group-hover:text-primary-400 transition-colors shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {data?.arquivos && data.arquivos.length === 0 && (
                                <Section title="Documentos do Edital">
                                    <p className="text-sm text-surface-500 italic">Nenhum documento anexado no PNCP.</p>
                                </Section>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-surface-700/50 bg-surface-900/80 shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {data?.linkPncp && (
                            <a
                                href={data.linkPncp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
                            >
                                <Globe className="h-4 w-4" />
                                Ver no PNCP
                            </a>
                        )}
                        {licitacao.linkSistemaOrigem && (
                            <a
                                href={licitacao.linkSistemaOrigem}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 rounded-xl transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Sistema Origem
                            </a>
                        )}
                        {licitacao.linkProcessoEletronico && (
                            <a
                                href={licitacao.linkProcessoEletronico}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-info bg-info/10 hover:bg-info/20 rounded-xl transition-colors"
                            >
                                <FileText className="h-4 w-4" />
                                Processo Eletrônico
                            </a>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-surface-400 hover:text-surface-200 bg-surface-800 hover:bg-surface-700 rounded-xl transition-colors cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon: Icon, label, value, highlight }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; highlight?: boolean }) {
    return (
        <div className="p-3 bg-surface-800/50 border border-surface-700/40 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5 text-surface-500" />
                <span className="text-xs text-surface-500">{label}</span>
            </div>
            <p className={`text-sm font-medium truncate ${highlight ? 'text-emerald-400' : 'text-surface-200'}`}>{value}</p>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-surface-300 mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-surface-700/50" />
                <span>{title}</span>
                <div className="h-px flex-1 bg-surface-700/50" />
            </h3>
            {children}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-xs text-surface-500 mb-0.5">{label}</p>
            <p className="text-sm text-surface-200">{value || '—'}</p>
        </div>
    );
}

function formatCnpj(cnpj: string): string {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return cnpj;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
