# Project Documentation and Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the repository documentation into a clear, product-owned guide from design through Docker/Azure deployment and dual-end release.

**Architecture:** Keep historical session notes and design records intact, while making the root README and docs index the current entry points. Separate product description, engineering conventions, release operations, and security rules so future sessions can find authoritative guidance without treating archived notes as current status.

**Tech Stack:** Markdown, GitHub, Docker, Azure Container Apps, Azure Database for PostgreSQL, CloudBase static hosting/CDN, uni-app, 微信开发者工具, HBuilderX.

---

### Task 1: Establish repository contribution and security rules

**Files:**
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`

- [x] **Step 1: Write contribution rules**

Document the product scope, branch/commit expectations, npm-first local workflow, required checks, documentation ownership, and the rule that generated output and local secrets stay untracked.

- [x] **Step 2: Write security policy**

Document secret locations, incident response for leaked keys, API boundary rules, personal-data handling, and the supported contact path for this personal project.

- [x] **Step 3: Review for product ownership**

Ensure the documents refer only to 和生序 and do not describe external products as dependencies or design authorities.

### Task 2: Rewrite the root README as the product and release entry point

**Files:**
- Modify: `README.md`

- [x] **Step 1: Add product overview**

Explain 和生序's purpose, target user, design language, and core health loop in user-facing language.

- [x] **Step 2: Add capability map**

Describe onboarding, weight goals, nutrition and food recognition, water, activity, sleep, mood, menstruation, medication, fasting, Xuxu chat, and Xuxu camera. Mark local-only persistence and production-backed capabilities accurately.

- [x] **Step 3: Add architecture and data flow**

Explain the uni-app client, NestJS API, PostgreSQL, AI gateway, GLM vision API, CloudBase CDN, Docker image, and Azure runtime boundaries.

- [x] **Step 4: Add setup and release paths**

Provide npm-based local commands, production environment variable names without values, Docker build/run commands, Azure deployment overview, WeChat mini-program upload path, and HBuilderX App path.

- [x] **Step 5: Add document map and truthful status**

Link to current docs, release checklist, app guide, architecture decisions, and clearly label known gaps.

### Task 3: Make the documentation index authoritative

**Files:**
- Modify: `docs/README.md`
- Modify: `docs/README-INDEX.md`

- [x] **Step 1: Define current documentation categories**

Organize links under product, engineering, deployment, integrations, release, architecture, and archive.

- [x] **Step 2: Mark canonical documents**

Identify `docs/DEPLOYMENT.md`, `docs/APP-RELEASE-HBUILDERX.md`, `docs/RELEASE-CHECKLIST.md`, and the engineering handoff docs as current references.

- [x] **Step 3: Keep historical records discoverable**

Place session summaries and old plans under an explicit archive section without deleting them.

### Task 4: Add a release checklist and reconcile deployment facts

**Files:**
- Create: `docs/RELEASE-CHECKLIST.md`
- Modify: `docs/DEPLOYMENT.md`

- [x] **Step 1: Add pre-release checklist**

Cover repository hygiene, tests, Docker image, Azure API/database, AI secrets, CloudBase assets, WeChat legal domains, AppSecret, mini-program upload/review, and HBuilderX Android/iOS prerequisites.

- [x] **Step 2: Add post-release verification**

Include `/health`, API smoke checks, CDN image check, database migration check, logs, rollback notes, and cost monitoring.

- [x] **Step 3: Reconcile current production status**

Keep the actual API/CDN endpoints, Azure resource names, image strategy, and the distinction between server-backed and local-only features. Never include secret values.

### Task 5: Validate, commit, and publish

**Files:**
- Verify: all changed Markdown files and repository status

- [x] **Step 1: Scan for sensitive values**

Run `git diff --check` and search changed docs for API keys, passwords, AppSecret values, `.env` contents, and private tokens.

- [x] **Step 2: Run documentation checks**

Run `npm exec -- prettier --check README.md CONTRIBUTING.md SECURITY.md docs/README.md docs/README-INDEX.md docs/RELEASE-CHECKLIST.md docs/DEPLOYMENT.md`.

- [x] **Step 3: Commit documentation**

Create one focused commit named `docs: establish project release and governance guide`.

- [x] **Step 4: Push and verify CI**

Push `main`, wait for GitHub CI and Pages workflows, and record their final status without changing unrelated code.
