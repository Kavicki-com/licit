import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

function getPrisma(req: Request): PrismaClient {
    return req.app.get('prisma') as PrismaClient;
}

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics.
 */
router.get('/stats', async (req: Request, res: Response) => {
    const prisma = getPrisma(req);

    try {
        const [total, analisar, aprovada, descartada, disputando, recentBids] = await Promise.all([
            prisma.licitacao.count(),
            prisma.licitacao.count({ where: { status: 'ANALISAR' } }),
            prisma.licitacao.count({ where: { status: 'APROVADA' } }),
            prisma.licitacao.count({ where: { status: 'DESCARTADA' } }),
            prisma.licitacao.count({ where: { status: 'DISPUTANDO' } }),
            prisma.licitacao.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    objetoCompra: true,
                    orgaoRazaoSocial: true,
                    valorTotalEstimado: true,
                    status: true,
                    createdAt: true,
                },
            }),
        ]);

        // Total estimated value
        const valorTotal = await prisma.licitacao.aggregate({
            _sum: { valorTotalEstimado: true },
            where: { status: { in: ['ANALISAR', 'APROVADA', 'DISPUTANDO'] } },
        });

        res.json({
            counts: { total, analisar, aprovada, descartada, disputando },
            valorTotalEstimado: valorTotal._sum.valorTotalEstimado || 0,
            recentBids,
        });
    } catch (error) {
        console.error('[API] Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export { router as dashboardRouter };
