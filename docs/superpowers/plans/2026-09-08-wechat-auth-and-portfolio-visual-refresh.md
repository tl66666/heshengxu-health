# 微信认证与个人网站视觉重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立小程序微信授权 -> 建档的明确流程，并重构个人网站三个低对比视觉区块。

**Architecture:** 在 uni-app 客户端新增平台专属认证路由决策和微信授权页，保留现有服务端身份提供方与数据隔离。个人网站在现有单页结构内使用分区级背景与实色内容面板，不改变项目画廊数据模型。

**Tech Stack:** Vue 3、uni-app、TypeScript、Vitest、NestJS、静态 HTML/CSS/JavaScript、GitHub Pages

---

### Task 1: 固化平台认证路由

**Files:**
- Create: `apps/mini/src/features/auth/auth-routing.ts`
- Create: `apps/mini/src/features/auth/auth-routing.spec.ts`
- Modify: `apps/mini/src/pages/bootstrap/BootstrapPage.vue`
- Modify: `apps/mini/src/App.vue`

- [ ] 写失败测试，断言 App 未登录进入 `AppAuthPage`，mp-weixin 未登录进入 `WechatAuthPage`，已登录继续档案检查。
- [ ] 运行 `npm test -- auth-routing.spec.ts`，确认新契约先失败。
- [ ] 实现纯函数平台路由决策，Bootstrap 与 App.vue 只调用该决策，不再混合平台条件。
- [ ] 运行认证相关测试并确认通过。

### Task 2: 新增微信授权页

**Files:**
- Create: `apps/mini/src/pages/auth/WechatAuthPage.vue`
- Create: `apps/mini/src/pages/auth/wechat-auth-page.spec.ts`
- Modify: `apps/mini/src/pages.json`
- Modify: `apps/mini/src/features/auth/auth-store.ts`

- [ ] 写页面契约测试，断言存在微信授权按钮、只调用 `loginWithWechat`、成功回到 Bootstrap、失败留在当前页。
- [ ] 实现明亮奶油白微信授权页面与加载/错误状态，不请求手机号。
- [ ] 将 Bootstrap 的循环 Modal 替换为到微信授权页的确定性跳转。
- [ ] 运行认证、Bootstrap 和页面契约测试。

### Task 3: 验证服务端微信登录与发布配置

**Files:**
- Modify: `apps/api/src/modules/auth/wechat-auth.service.spec.ts`（仅当缺少错误映射覆盖时）
- Modify: `docs/RELEASE-CHECKLIST.md`

- [ ] 运行微信认证服务测试，确认 code、配置缺失和微信错误码映射。
- [ ] 检查生产 API 地址、服务端环境变量引用和微信 request 合法域名文档。
- [ ] 更新发布清单，明确“微信授权成功 -> 建档 -> 首页”的真机验收顺序。

### Task 4: 构建与包体检查

**Files:**
- Generated only: `apps/mini/dist/build/mp-weixin`

- [ ] 运行 mini 单测和类型检查。
- [ ] 运行 mp-weixin 生产构建。
- [ ] 检查代码包大小、页面路由和生产 API 地址，确认不存在 App 登录页面自动跳转。

### Task 5: 重构个人网站视觉区域

**Files:**
- Modify: `C:/Users/唐乐/Desktop/个人网站/index.html`
- Modify: `C:/Users/唐乐/Desktop/个人网站/README.md`（仅当展示说明需要同步）

- [ ] 用 CSS 契约检查三个区块不使用纯黑背景或全区透明灰层。
- [ ] 重构实习经历为青绿数字工作流背景和高对比实色内容区。
- [ ] 重构竞赛荣誉为清透蓝紫背景与浅色证书内容区。
- [ ] 保留岗位能力的云层背景完整铺满，将文本放入局部深色实底区域。
- [ ] 复查和生序两张真实运行图无边框、黑底和容器阴影。
- [ ] 验证桌面与移动端无横向溢出、文字清晰、图片完整。

### Task 6: 提交与线上验证

- [ ] 只暂存和生序仓库本次认证、测试、文档文件并提交推送。
- [ ] 只暂存个人网站本次 HTML/文档文件并提交推送，不提交 `tmp/form-work/node_modules`。
- [ ] 验证 GitHub 远端源码、个人网站线上入口和微信构建目录。
