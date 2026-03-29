import axios from 'axios';
import type { Licitacao, PaginatedResponse, DashboardStats, StatusLicitacao } from '../types/licitacao';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

export async function fetchLicitacoes(params: {
    page?: number;
    limit?: number;
    status?: StatusLicitacao | '';
    search?: string;
    uf?: string;
    modalidade?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Licitacao>> {
    const { data } = await api.get<PaginatedResponse<Licitacao>>('/licitacoes', { params });
    return data;
}

export async function fetchLicitacao(id: string): Promise<Licitacao> {
    const { data } = await api.get<Licitacao>(`/licitacoes/${id}`);
    return data;
}

export async function updateStatus(id: string, status: StatusLicitacao, observacoes?: string): Promise<Licitacao> {
    const { data } = await api.put<Licitacao>(`/licitacoes/${id}/status`, { status, observacoes });
    return data;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/dashboard/stats');
    return data;
}

export async function triggerSync(): Promise<{ message: string; total: number; saved: number; skipped: number }> {
    const { data } = await api.post('/licitacoes/sync');
    return data;
}

export interface EditalArquivo {
    sequencialDocumento?: number;
    titulo?: string;
    url?: string;
    tipoDocumentoNome?: string;
    tipoDocumentoId?: number;
    dataPublicacao?: string;
}

export interface EditalResponse {
    licitacao: Licitacao;
    detalhes: any;
    termosDeReferencia: EditalArquivo[];
    outrosDocumentos: EditalArquivo[];
    arquivos: EditalArquivo[];
    itens: EditalItem[];
    linkPncp: string;
}

export interface EditalItem {
    numeroItem?: number;
    descricao?: string;
    materialOuServico?: string;
    materialOuServicoNome?: string;
    tipoBeneficio?: string;
    tipoBeneficioNome?: string;
    valorUnitarioEstimado?: number;
    valorTotal?: number;
    quantidade?: number;
    unidadeMedida?: string;
    situacaoCompraItemNome?: string;
    criterioJulgamentoNome?: string;
}

export async function fetchEdital(id: string): Promise<EditalResponse> {
    const { data } = await api.get<EditalResponse>(`/licitacoes/${id}/edital`);
    return data;
}
