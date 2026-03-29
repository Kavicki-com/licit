import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client';
import { isITRelated } from './keywords.js';

interface PncpOrgao {
    cnpj: string;
    razaoSocial: string;
}

interface PncpUnidade {
    ufNome?: string;
    ufSigla?: string;
    municipioNome?: string;
    nomeUnidade?: string;
    codigoUnidade?: string;
}

interface PncpContratacao {
    numeroControlePNCP: string;
    objetoCompra: string;
    informacaoComplementar?: string;
    valorTotalEstimado?: number;
    valorTotalHomologado?: number;
    dataPublicacaoPncp: string;
    dataAberturaProposta?: string;
    dataEncerramentoProposta?: string;
    orgaoEntidade: PncpOrgao;
    unidadeOrgao?: PncpUnidade;
    modalidadeId?: number;
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
}

interface PncpResponse {
    data: PncpContratacao[];
    totalRegistros: number;
    totalPaginas: number;
    numeroPagina: number;
    paginasRestantes: number;
    empty: boolean;
}

// Modality codes to search across
const MODALIDADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export class PncpService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.PNCP_API_BASE_URL || 'https://pncp.gov.br/api/consulta',
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
            },
        });
    }

    /**
     * Format date to PNCP expected format: yyyyMMdd
     */
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    /**
     * Fetch contratações from PNCP by publication date and modality.
     */
    async fetchContratacoes(
        dataInicial: Date,
        dataFinal: Date,
        codigoModalidade: number,
        pagina: number = 1,
    ): Promise<PncpResponse | null> {
        try {
            const response = await this.api.get<PncpResponse>('/v1/contratacoes/publicacao', {
                params: {
                    dataInicial: this.formatDate(dataInicial),
                    dataFinal: this.formatDate(dataFinal),
                    codigoModalidadeContratacao: codigoModalidade,
                    pagina,
                    tamanhoPagina: 50,
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 204 || error.response?.status === 404) {
                return null; // No data
            }
            console.error(`[PNCP] Error fetching modality ${codigoModalidade}, page ${pagina}:`, error.message);
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
    ): Promise<PncpContratacao[]> {
        const allData: PncpContratacao[] = [];
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

            // Small delay to be gentle on the API
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        return allData;
    }

    /**
     * Main sync method: fetch last 24h of bids, filter by IT keywords, and save.
     */
    async syncLicitacoes(prisma: PrismaClient): Promise<{ total: number; saved: number; skipped: number }> {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        console.log(`[PNCP Sync] Starting sync from ${yesterday.toISOString()} to ${now.toISOString()}`);

        let totalFetched = 0;
        let saved = 0;
        let skipped = 0;

        for (const modalidade of MODALIDADES) {
            console.log(`[PNCP Sync] Fetching modality ${modalidade}...`);

            const contratacoes = await this.fetchAllPages(yesterday, now, modalidade);
            totalFetched += contratacoes.length;

            for (const item of contratacoes) {
                // Apply IT keyword filter
                if (!isITRelated(item.objetoCompra, item.informacaoComplementar)) {
                    skipped++;
                    continue;
                }

                // Check if already exists
                const exists = await prisma.licitacao.findUnique({
                    where: { numeroControlePNCP: item.numeroControlePNCP },
                });

                if (exists) {
                    skipped++;
                    continue;
                }

                // Save to database
                try {
                    await prisma.licitacao.create({
                        data: {
                            numeroControlePNCP: item.numeroControlePNCP,
                            objetoCompra: item.objetoCompra,
                            informacaoComplementar: item.informacaoComplementar || null,
                            valorTotalEstimado: item.valorTotalEstimado || null,
                            valorTotalHomologado: item.valorTotalHomologado || null,
                            dataPublicacaoPncp: new Date(item.dataPublicacaoPncp),
                            dataAberturaProposta: item.dataAberturaProposta ? new Date(item.dataAberturaProposta) : null,
                            dataEncerramentoProposta: item.dataEncerramentoProposta ? new Date(item.dataEncerramentoProposta) : null,
                            orgaoCnpj: item.orgaoEntidade?.cnpj || '',
                            orgaoRazaoSocial: item.orgaoEntidade?.razaoSocial || '',
                            unidadeNome: item.unidadeOrgao?.nomeUnidade || null,
                            unidadeUf: item.unidadeOrgao?.ufSigla || null,
                            unidadeMunicipio: item.unidadeOrgao?.municipioNome || null,
                            modalidadeId: item.modalidadeId || null,
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
                        },
                    });
                    saved++;
                } catch (err: any) {
                    console.error(`[PNCP Sync] Error saving ${item.numeroControlePNCP}:`, err.message);
                }
            }
        }

        console.log(`[PNCP Sync] Complete: ${totalFetched} fetched, ${saved} saved, ${skipped} skipped`);
        return { total: totalFetched, saved, skipped };
    }
}

export const pncpService = new PncpService();
