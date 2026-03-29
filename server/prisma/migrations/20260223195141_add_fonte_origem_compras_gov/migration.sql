/*
  Warnings:

  - A unique constraint covering the columns `[idCompraGov]` on the table `licitacoes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "licitacoes" ADD COLUMN     "fonteOrigem" TEXT NOT NULL DEFAULT 'PNCP',
ADD COLUMN     "idCompraGov" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "licitacoes_idCompraGov_key" ON "licitacoes"("idCompraGov");

-- CreateIndex
CREATE INDEX "licitacoes_fonteOrigem_idx" ON "licitacoes"("fonteOrigem");
