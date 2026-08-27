# 当前实施计划

主目录只保留仍会执行的计划。已完成、被后续方案替代或仅用于追溯的计划统一存放于 [archive](archive/README.md)。

## 当前顺序

1. [健康档案稳定性设计](../specs/2026-08-27-health-profile-resilience-design.md)：继续完成编辑页的离线恢复、保存失败提示和“我的”页入口一致性。
2. [小程序前端全面重构](2026-08-26-mini-frontend-comprehensive-redesign.md)：按页面逐一验收首页、序序、记录、计划、我的页面；不再进行无计划的局部样式修改。
3. [食物识别生产边界](2026-08-26-food-recognition-production-boundary.md)：完成真实图片上传、CloudBase 私有存储与混元视觉 Provider，保持“候选后确认”的安全边界。
4. [Azure 测试环境](2026-08-27-azure-test-environment.md)：仅在本地功能和微信身份接入验收后创建云资源。

## 不在当前阶段执行的事项

- 不提前创建 Azure 资源或消耗代金券。
- 不在小程序放置 CloudBase、Azure 或模型密钥。
- 不再创建第二套 CloudBase 业务数据库。
- 不使用未核验授权的外部食品数据。

## 每轮质量门槛

每次修改小程序必须通过类型检查、相关 Vitest 测试和微信小程序构建验证；涉及服务端时还需通过对应 API 测试。只有通过后才提交。
