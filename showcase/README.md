# 和生序项目展示站

这是和生序项目的正式展示站，使用仓库中的原始水彩插画和真实工程资料，展示产品闭环、序序 AI、技术架构和部署链路。

- 在线地址：<https://tl66666.github.io/heshengxu-health/>
- GitHub 仓库：<https://github.com/tl66666/heshengxu-health>

## 本地运行

在仓库根目录执行：

```powershell
npx vite showcase --host 127.0.0.1 --port 4173
```

然后打开 <http://127.0.0.1:4173/>。如果 4173 端口已被占用，Vite 会提示实际端口。

展示站只依赖静态 HTML/CSS/JavaScript，不会读取数据库、API Key 或生产环境变量。插画通过 `../assets/illustrations/` 引用，资源目录只有一份，避免展示站产生重复素材。

## 页面内容

- 产品首屏与健康记录闭环
- 饮食、饮水、运动、睡眠、心情、生理期、用药和轻断食能力
- 序序聊天与序序相机的服务端 AI 边界
- uni-app、NestJS、Prisma、PostgreSQL、Docker、GHCR、Azure 和 CloudBase 链路
- 已完成范围与小程序/App 发布前仍需准备的审核事项

## 静态部署

执行 `npx vite build showcase` 后，`showcase/dist/` 是可以直接部署的静态目录，原始插画会被复制到输出目录的 `assets/` 下。开发源文件仍只保留一份 `assets/illustrations/`。

仓库通过 `.github/workflows/deploy-showcase.yml` 自动构建并发布 GitHub Pages。推送到 `main` 且修改展示站或插画资源时，会触发新的部署。
