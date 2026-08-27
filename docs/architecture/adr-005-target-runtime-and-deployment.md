# ADR-005: Target Runtime and Deployment Architecture

Status: accepted

Date: 2026-08-27

## Decision

The product keeps NestJS and PostgreSQL as the single source of truth for core business data. The same API serves the WeChat Mini Program and the future uni-app mobile application.

CloudBase is not a second business backend. It is used only for WeChat-adjacent capabilities: WeChat identity integration, private image storage, and server-side access to Hunyuan AI capabilities. Azure is the production runtime for the NestJS API and PostgreSQL database after the product passes local and test-environment acceptance.

## System Boundaries

```text
uni-app Mini Program / uni-app Mobile App
                  |
                  | HTTPS API requests
                  v
          NestJS modular API on Azure
                  |
                  v
          Azure Database for PostgreSQL
                  |
                  +-- health profiles, targets, plans, records, food entries
                  +-- AI consent, audit, and confirmed recognition results

NestJS server-side integrations
                  |
                  +-- CloudBase private storage for food images
                  +-- CloudBase / Hunyuan for approved AI requests
                  +-- WeChat login code exchange
```

The Mini Program and mobile app never contain Tencent Cloud, Azure, or AI provider secrets. They only send authenticated requests to the NestJS API.

## Why This Architecture

1. NestJS modules, Prisma migrations, PostgreSQL relations, API tests, and OpenAPI already exist in this repository. They are reusable for both Mini Program and App.
2. Health records require clear ownership, version history, audit data, and relational consistency. PostgreSQL is the authoritative store for these facts.
3. CloudBase provides useful Tencent and WeChat ecosystem capabilities, but maintaining a second CloudBase business database would create duplicate users, records, and debugging paths.
4. Azure credits can fund an always-on test or production API. Once deployed, users access Azure-hosted services; the developer's computer and Docker Desktop do not need to remain on.

## What Docker Means

Docker Desktop is a local development tool. It starts PostgreSQL and Redis on this computer so the NestJS API can be tested before deployment.

Docker is required only when a developer chooses to test the local API against local PostgreSQL and Redis. It is not required to compile the Mini Program, to use the published Mini Program, or to operate the production service.

## Environments

| Environment | API | Database | CloudBase | Docker requirement |
| --- | --- | --- | --- | --- |
| Mini Program UI development | local mock or local API | optional | no | no |
| Local API integration | local NestJS | local PostgreSQL and Redis | optional mock | yes |
| Shared test environment | Azure-hosted NestJS | Azure PostgreSQL | private storage and approved AI | no |
| Production | Azure-hosted NestJS | Azure PostgreSQL | private storage and approved AI | no |

## CloudBase Responsibilities

CloudBase is introduced in controlled steps:

1. Enable private cloud storage for food images. Files use a per-user prefix and are never public by default.
2. Use server credentials from NestJS to upload files and create short-lived read URLs. The Mini Program never receives provider credentials.
3. Call Hunyuan only from the server after explicit user consent. The model returns candidates, not confirmed health facts.
4. Require user confirmation before a food candidate creates a meal entry in PostgreSQL.

The enabled `hy3` text model is appropriate for future Xuxu conversation. It is not a food-photo recognition model. Image recognition requires a separately supported multimodal or vision model and an implemented server adapter.

## Azure Deployment Responsibilities

Azure is not needed today. Before external users are invited, deploy:

1. NestJS API to Azure Container Apps or App Service.
2. PostgreSQL to Azure Database for PostgreSQL Flexible Server.
3. Redis only after a feature has a real production need for it; do not pay for a managed cache prematurely.
4. Secrets through Azure environment configuration or Key Vault, never through Git, Mini Program code, or chat messages.
5. Continuous deployment from GitHub after automated checks pass.

The initial Azure deployment is a test environment. Production rollout follows after Mini Program flows, data backup, monitoring, and security checks are accepted.

## Development Order

1. Stabilize Mini Program pages, navigation, loading states, and local development configuration.
2. Consolidate API configuration so local, test, and production addresses are selected in one place.
3. Complete authenticated NestJS APIs and PostgreSQL persistence for the health-management MVP.
4. Implement CloudBase image-storage and Hunyuan adapters behind existing server interfaces.
5. Implement real WeChat login and replace the development token.
6. Deploy the API and database to Azure, then configure the Mini Program production API address.
7. Build Android and iOS applications from the same uni-app frontend and connect them to the same API.

## Non-Negotiable Rules

- One business fact has one authoritative database: PostgreSQL.
- No secrets in `apps/mini`, Git commits, screenshots, or chat messages.
- AI recognition remains a suggestion until a user confirms it.
- The Mini Program must display useful loading and failure states when the API is unavailable.
- Azure or CloudBase deployments must not depend on the developer's computer being online.
