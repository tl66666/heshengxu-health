# Azure Test Environment

This directory documents the first always-on test environment. It is intentionally documentation-only: no Azure resource is created until the Mini Program API is accepted locally and the account owner approves the expected cost.

## Selected Services

| Responsibility | Azure service | Reason |
| --- | --- | --- |
| NestJS API | Azure Container Apps | Runs the existing Node.js API in a container, provides HTTPS, and can scale down when idle. |
| Container image | Azure Container Registry | Keeps the API image private and deployable by Azure. |
| Business database | Azure Database for PostgreSQL Flexible Server | Managed PostgreSQL for the existing Prisma schema and migrations. |
| Secrets | Container Apps secrets, later Key Vault | Keeps database and CloudBase credentials outside Git and Mini Program builds. |
| Redis | Not provisioned initially | The current MVP does not require a managed production cache. Add it only when a measured feature needs it. |

## Intended Names

Use one resource group for the test environment:

```text
Resource group: rg-heshengxu-test
Container app: ca-heshengxu-api-test
Container registry: crheshengxutest
PostgreSQL server: psql-heshengxu-test
```

Names must be checked for Azure availability before creation. The production environment uses a separate resource group and separate database.

## Required Server Environment Variables

```text
NODE_ENV=production
API_PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/heban?schema=public
FOOD_RECOGNITION_STORAGE_PROVIDER=mock
FOOD_RECOGNITION_VISION_PROVIDER=mock
```

`DATABASE_URL` is a secret. `CLOUDBASE_ENV_ID`, `TENCENTCLOUD_SECRET_ID`, and `TENCENTCLOUD_SECRET_KEY` are added only after the CloudBase storage and Hunyuan adapters are implemented. None of these values belong in the Mini Program.

## Release Acceptance

Before the Mini Program uses this environment, verify all of the following:

1. The deployed API responds to `GET /health` over HTTPS with HTTP 200.
2. Prisma migrations have run against the Azure PostgreSQL database.
3. An authenticated `GET /api/v1/health-profiles/me` returns the expected envelope.
4. The Azure HTTPS domain is added to the WeChat Mini Program request-domain allowlist.
5. A test build with `VITE_MINI_API_BASE_URL=https://<azure-host>/api/v1` completes onboarding and reads the home page.
6. Logs do not contain database passwords, CloudBase credentials, raw food images, or AI provider responses.

## What Docker Does Not Do Here

Docker Desktop is not a production dependency. CI or Azure builds the API image; Azure runs it. The developer's computer may be turned off after deployment.
