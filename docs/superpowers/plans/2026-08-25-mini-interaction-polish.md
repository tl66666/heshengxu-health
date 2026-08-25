# 小程序交互与序序聊天改造实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完善微信小程序的返回退出、五栏导航、序序聊天和图标系统，使核心路径达到 Demo 的可用性。

**Architecture:** 继续使用 uni-app Vue 3。新增通用顶部导航和序序聊天组件，页面只负责组合；规则化回复留在前端演示层，未来通过 service 接入服务端 AI。

**Tech Stack:** uni-app、Vue 3、TypeScript、Vitest、微信小程序构建。

---

### Task 1: Navigation contracts

**Files:** Create `apps/mini/src/components/AppNavBar.vue`; modify onboarding and plan setup; test `apps/mini/src/components/navigation-contract.spec.ts`.

- [x] Define ordinary-page back and onboarding exit behavior.
- [x] Add tests for back target and exit confirmation contract.
- [ ] Implement and verify in WeChat build.

### Task 2: Icon and tab navigation

**Files:** Modify `apps/mini/src/components/MiniTabBar.vue`, records and me tabs; test `apps/mini/src/components/navigation-contract.spec.ts`.

- [x] Remove Unicode navigation glyphs from the new tab bar.
- [ ] Use `uni-icons` and verify all five tab routes.

### Task 3: Xuxu chat workflow

**Files:** Create `apps/mini/src/components/XuxuChatComposer.vue`; modify `apps/mini/src/pages/xuxu/XuxuPage.vue`; test `apps/mini/src/components/xuxu-chat.spec.ts`.

- [ ] Cover quick question, free text send, clear input, rule reply and safety boundary.
- [ ] Implement the chat surface and responsive fixed composer.

### Task 4: Verification and handoff

- [ ] Run Vitest, vue-tsc, Prettier and mp-weixin build.
- [ ] Verify generated WXML contains nav and chat controls.
- [ ] Commit and push only source, tests and docs.
