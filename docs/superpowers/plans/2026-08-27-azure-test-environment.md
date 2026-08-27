# Azure Test Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the existing NestJS API and PostgreSQL database to an Azure test environment that the WeChat Mini Program can reach through HTTPS without depending on a local computer.

**Architecture:** Azure Container Apps runs the NestJS API image; Azure Database for PostgreSQL Flexible Server holds the authoritative Prisma schema. CloudBase remains an external server-side integration, not the health-record database. The Mini Program receives only the public Azure HTTPS API URL during its build.

**Tech Stack:** Azure Container Apps, Azure Container Registry, Azure Database for PostgreSQL Flexible Server, NestJS, Prisma, GitHub Actions, uni-app.

---

### Task 1: Create the Azure test resource group and budget guardrail

**Files:**
- Modify: `infra/azure/README.md`

- [ ] In Azure Portal, create `rg-heshengxu-test` in the region selected for lowest cost and acceptable China-to-user latency.
- [ ] Create a Cost Management budget below the remaining Azure credit, with alerts at 50%, 80%, and 100%.
- [ ] Record only resource names and region in `infra/azure/README.md`; never record subscription IDs, passwords, or connection strings.
- [ ] Verify the budget alert exists before creating billable database resources.

### Task 2: Provision managed PostgreSQL and apply Prisma migrations

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Modify: `infra/azure/README.md`

- [ ] Create a Burstable Azure Database for PostgreSQL Flexible Server for the test environment, with a dedicated database named `heban` and a non-default administrator password stored only in Azure.
- [ ] Permit the deployment runner to reach PostgreSQL. Do not expose the database to the public Mini Program.
- [ ] Put the PostgreSQL connection string in a Container Apps secret named `database-url`.
- [ ] Run `pnpm --filter @heban/api prisma:deploy` in the deployment environment and verify `_prisma_migrations` contains every committed migration.
- [ ] Run the API E2E suite against the deployed database only after test users are isolated from local development data.

### Task 3: Package and deploy the NestJS API

**Files:**
- Create: `apps/api/Dockerfile`
- Create: `apps/api/.dockerignore`
- Create: `.github/workflows/deploy-azure-test.yml`

- [ ] Write a Docker build test that starts the built API image with test environment variables and verifies `GET /health` returns HTTP 200.
- [ ] Create a multi-stage Node 24 Dockerfile that installs locked workspace dependencies, builds `@heban/domain` and `@heban/api`, and runs only API runtime output in the final stage.
- [ ] Build the image locally or in CI and verify it contains no `.env`, `node_modules` from the host, source food SQL files, or Mini Program artifacts.
- [ ] Create Azure Container Registry and push the verified image.
- [ ] Create Azure Container Apps with `API_PORT=3000`, the `database-url` secret, and mock recognition providers. Verify `GET /health` over the Azure HTTPS FQDN.

### Task 4: Configure the Mini Program test build

**Files:**
- Create: `apps/mini/.env.test.example`
- Modify: `docs/engineering/local-development.md`

- [ ] Add `VITE_MINI_API_BASE_URL=https://<container-app-fqdn>/api/v1` to the example, with no credentials.
- [ ] Add the Container Apps HTTPS domain to WeChat Mini Program request-domain settings.
- [ ] Build the Mini Program with the test endpoint, complete onboarding, create one health record, and refresh it from a second Mini Program session.
- [ ] Record the acceptance date and FQDN in a private deployment record, not Git.

### Task 5: Enable production only after test acceptance

**Files:**
- Modify: `infra/azure/README.md`

- [ ] Create a new production resource group and database; never promote the test database directly.
- [ ] Enable automated backups, minimum log retention, HTTPS monitoring, and deployment approval before production rollout.
- [ ] Replace the local development bearer token with real WeChat login before external release.
- [ ] Implement CloudBase storage and Hunyuan adapters before enabling their production provider flags.
