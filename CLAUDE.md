# LicitTI (repo `licit`)

Informações verificadas nos arquivos e no git em 2026-11-04. Status pode ter mudado depois disso.

## O que é

Monitor de licitações de TI (`web/index.html`: "LicitTI — Monitor de Licitações de TI"). Busca compras públicas no PNCP, filtra por palavras-chave de TI (`server/src/services/keywords.ts`) e permite classificar cada licitação como ANALISAR, APROVADA, DESCARTADA ou DISPUTANDO (`server/prisma/schema.prisma`).

Público: as palavras-chave partem do CNAE de uma empresa (comentário em `keywords.ts`). Quem usa o app e se o uso é só interno: não determinado pelos arquivos.

## Stack

Versões do `package.json`; entre parênteses, a do lockfile.

- **`web/`** (versão 0.0.0): React ^19.2.0 (19.2.4), Vite ^7.3.1 (7.3.1), Tailwind CSS ^4.2.1 (4.2.1), TypeScript ~5.9.3 (5.9.3), axios ^1.13.5, lucide-react ^0.575.0.
- **`server/`** (versão 1.0.0): Express ^4.21.2 (4.22.1), Prisma e @prisma/client ^6.4.1 (6.19.2), PostgreSQL, node-cron ^3.0.3 (3.0.3), tsx ^4.19.2 (4.21.0), TypeScript ^5.7.3 (5.9.3).
- **Rodar local:** `npm run dev:server` e `npm run dev:web` na raiz. O Vite faz proxy de `/api` para `localhost:3001` (`web/vite.config.ts`). Variáveis em `server/.env.example`.
- **Regras do projeto:** `.agents/skills/licit-project.md`.
- Versão do Node: não declarada.

## Situação real

**Em desenvolvimento** (inferido; nenhum arquivo declara o status). Sem atividade no git desde 2026-03-29.

- `web/package.json` está na versão 0.0.0 e `web/README.md` ainda é o template do Vite.
- `.agents/skills/licit-project.md` só documenta execução local.
- O repo não tem config de deploy (Docker, Vercel, Render etc.) nem URL de produção.
- O histórico tem um único commit: `031d23d`, 2026-03-29.

Se existe alguma instância publicada: não determinado pelos arquivos. Falta config de deploy ou URL.

## Em andamento

- Só existe a branch `main`, igual a `origin/main`.
- Sem alterações em arquivos versionados (`git diff --stat` vazio).
- Não commitado: `package-lock.json` da raiz, sem dependências.

## Pendências

- Não há TODO, FIXME, HACK ou XXX no código, nem checklists em docs.
- `server/src/services/comprasGov.ts` exporta `comprasGovService`, mas nada em `server/src` ou `web/src` importa esse serviço. O banco já tem `fonteOrigem` e `idCompraGov`.
- `server/src/routes/licitacoes.ts` usa `any` em 4 pontos, contra a regra de tipagem do projeto.
- Nenhum `package.json` tem script de teste.
- `web/README.md` precisa ser substituído por documentação real.
- Pendência de segurança, ver código.
