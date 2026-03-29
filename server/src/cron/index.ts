import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { pncpService } from '../services/pncp.js';

export function startCronJobs(prisma: PrismaClient): void {
    const schedule = process.env.CRON_SCHEDULE || '0 7 * * *'; // Default: 7 AM daily

    console.log(`[Cron] Scheduling PNCP sync with schedule: ${schedule}`);

    cron.schedule(schedule, async () => {
        console.log(`[Cron] Running PNCP sync at ${new Date().toISOString()}`);
        try {
            const result = await pncpService.syncLicitacoes(prisma);
            console.log(`[Cron] Sync result:`, result);
        } catch (error) {
            console.error('[Cron] Sync failed:', error);
        }
    });

    console.log('[Cron] Jobs scheduled successfully');
}
