# 和生序项目展示站

这是和生序项目的正式展示站。页面结合品牌水彩插画与 8 张真实运行截图，展示微信小程序 / App 双端产品、49,479 条食物目录、序序相机识别闭环、序序 AI、技术架构和生产部署链路。

- 在线地址：<https://tl66666.github.io/heshengxu-health/>
- GitHub 仓库：<https://github.com/tl66666/heshengxu-health>

展示站同时提供微信小程序入口，扫描项目根目录 `assets/showcase/mini-program-code.jpg` 中的小程序码即可体验。

## 本地运行

在仓库根目录执行：

```powershell
npx vite showcase --host 127.0.0.1 --port 4173
```

然后打开 <http://127.0.0.1:4173/>。如果 4173 端口已被占用，Vite 会提示实际端口。

展示站只依赖静态 HTML/CSS/JavaScript，不会读取数据库、API Key 或生产环境变量。插画通过 `../assets/illustrations/` 引用，实机截图位于 `../assets/showcase/runtime/`，资源目录只有一份，避免展示站产生重复素材。

## 页面内容

- 双端产品首屏与真实运行截图证据墙
- 49,479 条食物目录与常见食物优先策略
- 序序相机从图片读取、视觉理解、营养估算、用户确认到保存记录的闭环
- 饮食、体重、饮水、运动、睡眠、心情、生理期、用药、轻断食和计划能力
- 序序聊天的真实回复与服务端 AI 安全边界
- uni-app、NestJS、Prisma、PostgreSQL、Docker、GHCR、Azure 和 CloudBase 链路
- 已完成范围与小程序/App 发布前仍需准备的审核事项

## 静态部署

执行 `npx vite build showcase` 后，`showcase/dist/` 是可以直接部署的静态目录，原始插画会被复制到输出目录的 `assets/` 下。开发源文件仍只保留一份 `assets/illustrations/`。

仓库通过 `.github/workflows/deploy-showcase.yml` 自动构建并发布 GitHub Pages。推送到 `main` 且修改展示站或插画资源时，会触发新的部署。

## 双端构建入口

- 微信小程序正式上传目录：`apps/mini/dist/build/mp-weixin`。先执行仓库根目录的 `scripts/build-mini.ps1`，脚本会远程化位图并校验体积；最近一次产物约 0.88 MB。
- HBuilderX App 源码目录：`D:\heshengxu-mini\apps\mini`。这是仓库源码的英文路径联接，不是构建产物。
- `dist/dev/mp-weixin` 仅用于开发预览，不能作为正式上传包。
- Android 测试包：[`assets/showcase/heshengxu-android.apk`](../assets/showcase/heshengxu-android.apk)。
