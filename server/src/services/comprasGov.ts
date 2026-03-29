import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client';
import { isITRelated } from './keywords.js';

/**
 * Shape of a contratação returned by dadosabertos.compras.gov.br
 * Endpoint: /modulo-contratacoes/1_consultarContratacoes_PNCP_14133
 */
interface ComprasContratacao {
    idCompra: string;
    objetoCompra: string;
    informacaoComplementar?: string;
    valorTotalEstimado?: number;
    valorTotalHomologado?: number;
    dataPublicacaoPncp?: string;
    dataAberturaProposta?: string;
    dataEncerramentoProposta?: string;
    orgaoEntidadeCnpj?: string;
    orgaoEntidadeRazaoSocial?: string;
    unidadeOrgaoNomeUnidade?: string;
    unidadeOrgaoUfSigla?: string;
    unidadeOrgaoMunicipioNome?: string;
    codigoModalidade?: number;
    modalidadeNome?: string;
    modoDisputaNome?: string;
    situacaoCompraNome?: string;
    srp?: boolean;
    linkSistemaOrigem?: string;
    linkProcessoEletronico?: string;
    anoCompra?: number;
    sequencialCompra?: number;
    numeroCompra?: string;
    processo?: string;
    numeroControlePNCP?: string;
}

interface ComprasResponse {
    data: ComprasContratacao[];
    totalRegistros: number;
    totalPaginas: number;
    numeroPagina: number;
    paginasRestantes: number;
    empty: boolean;
}

/**
 * Shape of an item returned by the items endpoint
 * Endpoint: /modulo-contratacoes/2_consultarItensContratacoes_PNCP_14133
 */
export interface ComprasItem {
    idItem: string;
    numeroItem: number;
    descricao: string;
    descricaoDetalhada?: string;
    quantidade?: number;
    valorUnitarioEstimado?: number;
    valorTotal?: number;
    unidadeMedida?: string;
    situacaoItemNome?: string;
    codFornecedor?: string;
    nomeFornecedor?: string;
}

interface ComprasItemResponse {
    data: ComprasItem[];
    totalRegistros: number;
    totalPaginas: number;
    numeroPagina: number;
    paginasRestantes: number;
    empty: boolean;
}

// Same modality codes as PNCP
const MODALIDADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export class ComprasGovService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: 'https://dadosabertos.compras.gov.br',
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
            },
        });
    }

    /**
     * Format date to API expected format: yyyy-MM-dd
     */
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Fetch contratações from Compras.gov by publication date and modality.
     */
    async fetchContratacoes(
        dataInicial: Date,
        dataFinal: Date,
        codigoModalidade: number,
        pagina: number = 1,
    ): Promise<ComprasResponse | null> {
        try {
            const response = await this.api.get<ComprasResponse>(
                '/modulo-contratacoes/1_consultarContratacoes_PNCP_14133',
                {
                    params: {
                        dataPublicacaoPncpInicial: this.formatDate(dataInicial),
                        dataPublicacaoPncpFinal: this.formatDate(dataFinal),
                        codigoModalidade,
                        pagina,
                        tamanhoPagina: 50,
                    },
                },
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 204 || error.response?.status === 404) {
                return null;
            }
            console.error(`[ComprasGov] Error fetching modality ${codigoModalidade}, page ${pagina}:`, error.message);
            return null;
        }
    }

    /**
     * Fetch ALL pages for a given modality within a date range.
     */
    async fetchAllPages(
        dataInicial: Date,
        dataFinal: Date,
        codigoModalidade: number,
    ): Promise<ComprasContratacao[]> {
        const allData: ComprasContratacao[] = [];
        let pagina = 1;
        let hasMore = true;

        while (hasMore) {
            const response = await this.fetchContratacoes(dataInicial, dataFinal, codigoModalidade, pagina);

            if (!response || response.empty || !response.data || response.data.length === 0) {
                break;
            }

            allData.push(...response.data);

            if (response.paginasRestantes <= 0) {
                hasMore = false;
            } else {
                pagina++;
            }

            // Polite delay
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        return allData;
    }

    /**
     * Fetch items for a specific contratação (used on EditalModal).
     */
    async fetchItensContratacao(
        dataInicial: Date,
        dataFinal: Date,
        codigoModalidade: number,
    ): Promise<ComprasItem[]> {
        const allItems: ComprasItem[] = [];
        let pagina = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                const response = await this.api.get<ComprasItemResponse>(
                    '/modulo-contratacoes/2_consultarItensContratacoes_PNCP_14133',
                    {
                        params: {
                            dataPublicacaoPncpInicial: this.formatDate(dataInicial),
                            dataPublicacaoPncpFinal: this.formatDate(dataFinal),
                            codigoModalidade,
                            pagina,
                            tamanhoPagina: 50,
                        },
                    },
                );

                const data = response.data;
                if (!data || data.empty || !data.data || data.data.length === 0) {
                    break;
                }

                allItems.push(...data.data);

                if (data.paginasRestantes <= 0) {
                    hasMore = false;
                } else {
                    pagina++;
                }

                await new Promise((resolve) => setTimeout(resolve, 300));
            } catch (error: any) {
                console.error(`[ComprasGov] Error fetching items:`, error.message);
                break;
            }
        }

        return allItems;
    }

    /**
     * Main sync method: fetch last 24h of bids, filter by IT keywords, and save.
     */
    async syncLicitacoes(prisma: PrismaClient): Promise<{ total: number; saved: number; skipped: number }> {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        console.log(`[ComprasGov Sync] Starting sync from ${yesterday.toISOString()} to ${now.toISOString()}`);

        let totalFetched = 0;
        let saved = 0;
        let skipped = 0;

        for (const modalidade of MODALIDADES) {
            console.log(`[ComprasGov Sync] Fetching modality ${modalidade}...`);

            const contratacoes = await this.fetchAllPages(yesterday, now, modalidade);
            totalFetched += contratacoes.length;

            for (const item of contratacoes) {
                // Apply IT keyword filter
                if (!isITRelated(item.objetoCompra, item.informacaoComplementar)) {
                    skipped++;
                    continue;
                }

                // Build a unique key: idCompra is unique per contratação on compras.gov
                const idCompraGov = item.idCompra;

                if (!idCompraGov) {
                    skipped++;
                    continue;
                }

                // Check if already exists (by compras.gov ID or PNCP control number)
                const existsByGov = await prisma.licitacao.findUnique({
                    where: { idCompraGov },
                });
                if (existsByGov) {
                    skipped++;
                    continue;
                }

                // Also check by PNCP number to avoid cross-source duplicates
                if (item.numeroControlePNCP) {
                    const existsByPncp = await prisma.licitacao.findUnique({
                        where: { numeroControlePNCP: item.numeroControlePNCP },
                    });
                    if (existsByPncp) {
                        // Update existing PNCP record with the compras.gov ID
                        await prisma.licitacao.update({
                            where: { numeroControlePNCP: item.numeroControlePNCP },
                            data: { idCompraGov },
                        });
                        skipped++;
                        continue;
                    }
                }

                // Save to database
                try {
                    await prisma.licitacao.create({
                        data: {
                            // Use PNCP control number if available, otherwise generate a unique one
                            numeroControlePNCP: item.numeroControlePNCP || `COMPRAS-${idCompraGov}`,
                            objetoCompra: item.objetoCompra,
                            informacaoComplementar: item.informacaoComplementar || null,
                            valorTotalEstimado: item.valorTotalEstimado || null,
                            valorTotalHomologado: item.valorTotalHomologado || null,
                            dataPublicacaoPncp: item.dataPublicacaoPncp ? new Date(item.dataPublicacaoPncp) : new Date(),
                            dataAberturaProposta: item.dataAberturaProposta ? new Date(item.dataAberturaProposta) : null,
                            dataEncerramentoProposta: item.dataEncerramentoProposta ? new Date(item.dataEncerramentoProposta) : null,
                            orgaoCnpj: item.orgaoEntidadeCnpj || '',
                            orgaoRazaoSocial: item.orgaoEntidadeRazaoSocial || '',
                            unidadeNome: item.unidadeOrgaoNomeUnidade || null,
                            unidadeUf: item.unidadeOrgaoUfSigla || null,
                            unidadeMunicipio: item.unidadeOrgaoMunicipioNome || null,
                            modalidadeId: item.codigoModalidade || null,
                            modalidadeNome: item.modalidadeNome || null,
                            modoDisputaNome: item.modoDisputaNome || null,
                            situacaoCompraNome: item.situacaoCompraNome || null,
                            srp: item.srp || false,
                            linkSistemaOrigem: item.linkSistemaOrigem || null,
                            linkProcessoEletronico: item.linkProcessoEletronico || null,
                            anoCompra: item.anoCompra || null,
                            sequencialCompra: item.sequencialCompra || null,
                            numeroCompra: item.numeroCompra || null,
                            processo: item.processo || null,
                            fonteOrigem: 'COMPRAS_GOV',
                            idCompraGov,
                        },
                    });
                    saved++;
                } catch (err: any) {
                    console.error(`[ComprasGov Sync] Error saving ${idCompraGov}:`, err.message);
                }
            }
        }

        console.log(`[ComprasGov Sync] Complete: ${totalFetched} fetched, ${saved} saved, ${skipped} skipped`);
        return { total: totalFetched, saved, skipped };
    }
}

export const comprasGovService = new ComprasGovService();
