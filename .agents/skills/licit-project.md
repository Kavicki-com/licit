---
name: licit-project
description: General instructions and architecture rules for the Licit (Public Procurement) project
---

# Licit Project Guidelines

## Project Context
The `licit` project is a full-stack web application designed to track and manage public procurement processes (Licitações) from PNCP (Portal Nacional de Contratações Públicas).
- The web app is located in `web/` (React, Vite, Tailwind, TS).
- The server app is located in `server/` (Express, Prisma, Node.js, TS).

## Architectural Rules
1. **Frontend (React)**: 
   - State management is currently done via React Hooks (e.g. `useState`). If modifying data (like Kanban statuses), you must add optimistic UI updates where applicable to ensure UI responsiveness.
   - Use Tailwind utility classes for all new components. 
   - Icons should be imported from `lucide-react`.

2. **Backend (Express + Prisma)**:
   - Always export router models from `src/routes/` and mount them in `src/index.ts`.
   - Data-fetching logic (such as PNCP APIs) should be kept in `src/services/` to separate it from route definitions.
   - Run Prisma migrations locally before committing changes (`npx prisma migrate dev`).

3. **External Integration (PNCP)**:
   - Handle rate-limiting and timeouts gracefully when dealing with the PNCP API (`https://pncp.gov.br`). Responses might be large (like `/:id/edital`).

4. **Typing**:
   - Do not use `any` types for new integrations. Ensure valid TypeScript interfaces are written for PNCP responses and Database models.

## How to Run Locally
1. Server: `npm run dev:server` from the root directory, or `npm run dev` inside `server/`.
2. Web: `npm run dev:web` from the root directory, or `npm run dev` inside `web/`.
