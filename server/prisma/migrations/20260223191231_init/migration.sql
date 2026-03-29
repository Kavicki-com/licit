-- CreateEnum
CREATE TYPE "StatusLicitacao" AS ENUM ('ANALISAR', 'APROVADA', 'DESCARTADA', 'DISPUTANDO');

-- CreateTable
CREATE TABLE "licitacoes" (
    "id" TEXT NOT NULL,
    "numeroControlePNCP" TEXT NOT NULL,
    "objetoCompra" TEXT NOT NULL,
    "informacaoComplementar" TEXT,
    "valorTotalEstimado" DECIMAL(18,2),
    "valorTotalHomologado" DECIMAL(18,2),
    "dataPublicacaoPncp" TIMESTAMP(3) NOT NULL,
    "dataAberturaProposta" TIMESTAMP(3),
    "dataEncerramentoProposta" TIMESTAMP(3),
    "orgaoCnpj" TEXT NOT NULL,
    "orgaoRazaoSocial" TEXT NOT NULL,
    "unidadeNome" TEXT,
    "unidadeUf" TEXT,
    "unidadeMunicipio" TEXT,
    "modalidadeId" INTEGER,
    "modalidadeNome" TEXT,
    "modoDisputaNome" TEXT,
    "situacaoCompraNome" TEXT,
    "srp" BOOLEAN NOT NULL DEFAULT false,
    "linkSistemaOrigem" TEXT,
    "linkProcessoEletronico" TEXT,
    "anoCompra" INTEGER,
    "sequencialCompra" INTEGER,
    "numeroCompra" TEXT,
    "processo" TEXT,
    "status" "StatusLicitacao" NOT NULL DEFAULT 'ANALISAR',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licitacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "licitacoes_numeroControlePNCP_key" ON "licitacoes"("numeroControlePNCP");

-- CreateIndex
CREATE INDEX "licitacoes_status_idx" ON "licitacoes"("status");

-- CreateIndex
CREATE INDEX "licitacoes_dataPublicacaoPncp_idx" ON "licitacoes"("dataPublicacaoPncp");

-- CreateIndex
CREATE INDEX "licitacoes_orgaoCnpj_idx" ON "licitacoes"("orgaoCnpj");
