# 和生序视觉资产

`assets/illustrations/` 是项目唯一的图片源目录。所有 Demo 和 uni-app 页面都从这里选图；小程序构建前由 `scripts/sync-illustrations.mjs` 自动同步到 `apps/mini/src/static/illustrations/`，后者是构建缓存，不提交 Git。

## 命名约定

- `hero.jpg`：建档欢迎与启动页
- `xuxu-avatar.jpg`：序序身份头像、底部中央入口
- `home-companion-banner.png`：首页今日陪伴
- `record-desk-banner.png`：记录页首次记录和空状态
- `program-*.png`：健康计划主题封面
- `xuxu-record-reminder.png`：缺少记录时的温和提醒
- `xuxu-complete.png`：任务完成状态
- `insight-report-banner.png`：周回顾顶部，需有真实数据后启用
- `xuxu-ai-empty.png` / `xuxu-safe-support.png`：AI 页面空状态和安全支持
- `xuxu-sleep-reminder.png`：睡眠场景提醒
- `leaf-corner-decoration.png`：数据/回顾页面的轻装饰

不要在 `apps/mini/src/static/illustrations/` 手工新增或修改图片；修改源图后重新运行开发或构建脚本即可。
