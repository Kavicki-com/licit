import { Router, Request, Response } from 'express';
import { PrismaClient, StatusLicitacao } from '@prisma/client';

const router = Router();

function getPrisma(req: Request): PrismaClient {
    return req.app.get('prisma') as PrismaClient;
}

/**
 * GET /api/licitacoes
 * List all bids with filters and pagination.
 */
router.get('/', async (req: Request, res: Response) => {
    const prisma = getPrisma(req);
    const {
        status,
        search,
        uf,
        modalidade,
        page = '1',
        limit = '20',
        sortBy = 'dataPublicacaoPncp',
        sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status && Object.values(StatusLicitacao).includes(status as StatusLicitacao)) {
        where.status = status as StatusLicitacao;
    }

    if (uf) {
        where.unidadeUf = (uf as string).toUpperCase();
    }

    if (modalidade) {
        const modalidades = (modalidade as string).split(',').map(m => m.trim()).filter(Boolean);
        if (modalidades.length === 1) {
            where.modalidadeNome = { contains: modalidades[0], mode: 'insensitive' };
        } else if (modalidades.length > 1) {
            // Use AND to keep this separate from the search OR
            where.AND = [
                ...(where.AND || []),
                { OR: modalidades.map(m => ({ modalidadeNome: { contains: m, mode: 'insensitive' as const } })) },
            ];
        }
    }

    if (search) {
        where.AND = [
            ...(where.AND || []),
            {
                OR: [
                    { objetoCompra: { contains: search as string, mode: 'insensitive' } },
                    { orgaoRazaoSocial: { contains: search as string, mode: 'insensitive' } },
                    { informacaoComplementar: { contains: search as string, mode: 'insensitive' } },
                ],
            },
        ];
    }

    try {
        const [licitacoes, total] = await Promise.all([
            prisma.licitacao.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { [sortBy as string]: sortOrder as string },
            }),
            prisma.licitacao.count({ where }),
        ]);

        res.json({
            data: licitacoes,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('[API] Error listing licitacoes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/licitacoes/:id
 * Get a single bid by ID.
 */
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    const prisma = getPrisma(req);

    try {
        const licitacao = await prisma.licitacao.findUnique({
            where: { id: req.params.id },
        });

        if (!licitacao) {
            res.status(404).json({ error: 'Licitação não encontrada' });
            return;
        }

        res.json(licitacao);
    } catch (error) {
        console.error('[API] Error fetching licitacao:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT /api/licitacoes/:id/status
 * Update the Kanban status of a bid.
 */
router.put('/:id/status', async (req: Request<{ id: string }>, res: Response) => {
    const prisma = getPrisma(req);
    const { status, observacoes } = req.body;

    if (!status || !Object.values(StatusLicitacao).includes(status)) {
        res.status(400).json({
            error: 'Status inválido. Use: ANALISAR, APROVADA, DESCARTADA, DISPUTANDO',
        });
        return;
    }

    try {
        const licitacao = await prisma.licitacao.update({
            where: { id: req.params.id },
            data: {
                status,
                ...(observacoes !== undefined && { observacoes }),
            },
        });

        res.json(licitacao);
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Licitação não encontrada' });
            return;
        }
        console.error('[API] Error updating status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/licitacoes/:id/edital
 * Fetch the full edital details from the PNCP API (proxy).
 * Includes: contratação details, arquivos, itens, and termo de referência.
 */
router.get('/:id/edital', async (req: Request<{ id: string }>, res: Response) => {
    const prisma = getPrisma(req);

    try {
        const licitacao = await prisma.licitacao.findUnique({
            where: { id: req.params.id },
        });

        if (!licitacao) {
            res.status(404).json({ error: 'Licitação não encontrada' });
            return;
        }

        if (!licitacao.orgaoCnpj || !licitacao.anoCompra || !licitacao.sequencialCompra) {
            res.status(400).json({ error: 'Dados insuficientes para consultar o edital no PNCP' });
            return;
        }

        const { default: axios } = await import('axios');
        const baseUrl = process.env.PNCP_API_BASE_URL || 'https://pncp.gov.br/api/consulta';
        const cnpj = licitacao.orgaoCnpj.replace(/[^\d]/g, '');
        const compraPath = `${baseUrl}/v1/orgaos/${cnpj}/compras/${licitacao.anoCompra}/${licitacao.sequencialCompra}`;
        const requestConfig = { timeout: 15000, headers: { Accept: 'application/json' } };

        // Fetch all data in parallel: details, arquivos, itens
        const [compraRes, arquivosRes, itensRes] = await Promise.allSettled([
            axios.get(compraPath, requestConfig),
            axios.get(`${compraPath}/arquivos`, requestConfig),
            axios.get(`${compraPath}/itens`, requestConfig),
        ]);

        const compra = compraRes.status === 'fulfilled' ? compraRes.value.data : null;
        const arquivosRaw = arquivosRes.status === 'fulfilled' ? arquivosRes.value.data : [];
        const itensRaw = itensRes.status === 'fulfilled' ? itensRes.value.data : [];

        const arquivos = Array.isArray(arquivosRaw) ? arquivosRaw : [];
        const itens = Array.isArray(itensRaw) ? itensRaw : [];

        // Separate Termos de Referência from other documents
        const termosDeReferencia = arquivos.filter((a: any) =>
            a.tipoDocumentoNome?.toLowerCase().includes('termo') ||
            a.titulo?.toLowerCase().includes('termo de refer') ||
            a.titulo?.toLowerCase().includes('tr ') ||
            a.tipoDocumentoId === 3
        );

        const outrosDocumentos = arquivos.filter((a: any) =>
            !(a.tipoDocumentoNome?.toLowerCase().includes('termo') ||
                a.titulo?.toLowerCase().includes('termo de refer') ||
                a.titulo?.toLowerCase().includes('tr ') ||
                a.tipoDocumentoId === 3)
        );

        // Build PNCP portal link
        const linkPncp = `https://pncp.gov.br/app/editais/${cnpj}/${licitacao.anoCompra}/${licitacao.sequencialCompra}`;

        res.json({
            licitacao,
            detalhes: compra,
            termosDeReferencia,
            outrosDocumentos,
            arquivos,
            itens,
            linkPncp,
        });
    } catch (error) {
        console.error('[API] Error fetching edital:', error);
        res.status(500).json({ error: 'Erro ao buscar edital no PNCP' });
    }
});

/**
 * POST /api/licitacoes/sync
 * Manually trigger a PNCP sync.
 */
router.post('/sync', async (req: Request, res: Response) => {
    const prisma = getPrisma(req);

    try {
        const { pncpService } = await import('../services/pncp.js');
        const result = await pncpService.syncLicitacoes(prisma);
        res.json({ message: 'Sync completed', ...result });
    } catch (error) {
        console.error('[API] Error during sync:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

export { router as licitacaoRouter };
