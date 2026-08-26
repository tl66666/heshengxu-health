# 小程序插画资源清单

这份清单约束图片和页面容器的对应关系，避免把不同比例的素材强行塞进同一个卡片。

| 资源 | 使用页面 | 设计容器 | 显示策略 | 说明 |
| --- | --- | --- | --- | --- |
| `onboarding-hero-vertical.png` | Bootstrap 启动页 | 全屏背景 | `aspectFit` + 底部轻遮罩 | 保留完整竖屏构图，遮罩只服务底部文字可读性 |
| `onboarding-hero-square.png` | Onboarding 建档欢迎页 | 方形主视觉 | `aspectFit` | 主体完整显示，不裁切、不拉伸 |
| `home-companion-banner.png` | 首页今日主卡 | 3:2 横向卡片 | `aspectFit` | 卡片高度 456rpx，与原图比例匹配，避免右侧空白 |
| `record-desk-banner.png` | 记录页欢迎条 | 横向欢迎条 | `aspectFit` | 保留桌面场景完整构图 |
| `program-*.png` | 计划设置、计划页 | 单项场景卡 | `aspectFill` | 场景卡允许轻微裁切，但不覆盖标题和操作区 |
| `xuxu-avatar.jpg` | 头像、序序入口 | 圆形头像 | `aspectFill` | 只用于头像，不作为大面积背景 |
| `xuxu-*.png` | 空状态、完成、提醒、安全 | 插画内容区 | `aspectFit` | 透明或留白属于插画本身，不再叠加高透明度遮罩 |

## 暂存素材

以下素材目前不放入小程序首屏，避免为了“用上图片”而造成页面堆叠：

- `insight-report-banner.png`：后续健康报告页的横幅。
- `leaf-corner-decoration.png`：网页端或专题页的角落装饰，不用于小程序功能卡片。
- `xuxu-sleep-reminder.png`：睡眠提醒场景，等睡眠记录流程上线后使用。
- `hero.jpg`：网页端项目展示，禁止回流到小程序建档或首页。

新增图片必须先放入 `assets/illustrations/`，再由同步脚本复制到 `apps/mini/src/static/illustrations/`；接入前先确认原图比例、主体位置和目标容器比例。
