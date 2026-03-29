export type StatusLicitacao = 'ANALISAR' | 'APROVADA' | 'DESCARTADA' | 'DISPUTANDO';

export interface Licitacao {
    id: string;
    numeroControlePNCP: string;
    objetoCompra: string;
    informacaoComplementar: string | null;
    valorTotalEstimado: number | null;
    valorTotalHomologado: number | null;
    dataPublicacaoPncp: string;
    dataAberturaProposta: string | null;
    dataEncerramentoProposta: string | null;
    orgaoCnpj: string;
    orgaoRazaoSocial: string;
    unidadeNome: string | null;
    unidadeUf: string | null;
    unidadeMunicipio: string | null;
    modalidadeId: number | null;
    modalidadeNome: string | null;
    modoDisputaNome: string | null;
    situacaoCompraNome: string | null;
    srp: boolean;
    linkSistemaOrigem: string | null;
    linkProcessoEletronico: string | null;
    anoCompra: number | null;
    sequencialCompra: number | null;
    numeroCompra: string | null;
    processo: string | null;
    status: StatusLicitacao;
    observacoes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface DashboardStats {
    counts: {
        total: number;
        analisar: number;
        aprovada: number;
        descartada: number;
        disputando: number;
    };
    valorTotalEstimado: number;
    recentBids: Pick<Licitacao, 'id' | 'objetoCompra' | 'orgaoRazaoSocial' | 'valorTotalEstimado' | 'status' | 'createdAt'>[];
}
