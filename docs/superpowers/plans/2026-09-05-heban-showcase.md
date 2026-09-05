# 和生序展示站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality single-page project showcase for 和生序 using the repository's existing watercolor illustrations and factual product/engineering content.

**Architecture:** A framework-free Vite-served page lives in `showcase/`. HTML owns semantic content, CSS owns the visual system and responsive layout, and a small JavaScript module owns navigation and progressive disclosure. Images remain in the canonical `assets/illustrations/` directory and are never duplicated.

**Tech Stack:** HTML, modern CSS, vanilla JavaScript, Vite dev server, existing PNG/JPG illustration assets.

---

### Task 1: Create the semantic showcase page

**Files:**
- Create: `showcase/index.html`

- [ ] **Step 1: Add navigation, hero, product loop, capability sections, AI boundary, architecture, delivery, status, and footer markup.**
- [ ] **Step 2: Use only factual copy from the repository README and deployment docs.**
- [ ] **Step 3: Reference `../assets/illustrations/` directly for all artwork.**

### Task 2: Implement the visual system and responsive layout

**Files:**
- Create: `showcase/styles.css`

- [ ] **Step 1: Define cream, forest, leaf, apricot, blue, spacing, type, radius, and shadow tokens.**
- [ ] **Step 2: Implement open bands, media-led split sections, a technical architecture diagram, and delivery timeline.**
- [ ] **Step 3: Add desktop/tablet/mobile breakpoints and reduced-motion handling.**
- [ ] **Step 4: Keep all images complete with `object-fit: contain` or controlled background positioning.**

### Task 3: Add small, meaningful interactions

**Files:**
- Create: `showcase/app.js`

- [ ] **Step 1: Toggle the mobile navigation and close it after selecting an anchor.**
- [ ] **Step 2: Add `IntersectionObserver` reveal classes with an immediate fallback.**
- [ ] **Step 3: Add an accessible engineering-details disclosure and update its label/state.**

### Task 4: Verify and document local usage

**Files:**
- Create: `showcase/README.md`

- [ ] **Step 1: Document the Vite command, URL, asset boundary, and static deployment expectations.**
- [ ] **Step 2: Start the local server and verify page identity, anchors, interaction, console, and responsive screenshots.**
- [ ] **Step 3: Remove temporary screenshots or scripts from the repository before handoff.**
