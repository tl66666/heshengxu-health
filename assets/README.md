# 和生序视觉资产

`assets/illustrations/` 是项目插画的唯一源目录，`assets/mini-icons/` 是小程序与 App 位图图标的唯一源目录。所有页面都从这两处选图；需要本地位图的微信开发构建前，由 `scripts/sync-illustrations.mjs` 临时同步到 `apps/mini/src/static/`。HBuilderX 云打包时，源码目录默认不保留这些大位图，生产构建通过 CloudBase HTTPS 地址加载原图。

## 命名约定

- `hero.jpg`：建档欢迎与启动页
- `xuxu-avatar.jpg`：旧版序序身份头像，保留作历史素材
- `xuxu-avatar.png`：高清序序身份头像、底部中央入口和聊天头像
- `home-companion-banner.png`：旧版首页今日陪伴横幅，保留作历史素材
- `home-hero-morning.png`：首页晨间主视觉，4:5 竖构图，右上预留文案空间
- `record-desk-banner.png`：记录页首次记录和空状态
- `program-*.png`：健康计划主题封面
- `xuxu-record-reminder.png`：缺少记录时的温和提醒
- `xuxu-complete.png`：任务完成状态
- `insight-report-banner.png`：旧版周回顾横幅，保留作历史素材
- `weekly-insight-banner.png`：周回顾顶部宽幅横幅，右侧预留数据文案空间
- `xuxu-ai-empty.png` / `xuxu-safe-support.png`：AI 页面空状态和安全支持
- `xuxu-sleep-reminder.png`：睡眠场景提醒
- `leaf-corner-decoration.png`：数据/回顾页面的轻装饰

不要在 `apps/mini/src/static/illustrations/` 手工新增或修改图片；修改源图后重新运行开发或构建脚本即可。
