# 和生序上线清单

这份清单用于第一次部署正式 API 和微信小程序。建议第一次先部署测试环境，完成真机验收后再切生产。密钥只配置在部署平台的环境变量中，不写入仓库，也不放进小程序包。

## 推荐部署拓扑

| 能力 | 推荐平台 | 说明 |
| --- | --- | --- |
| NestJS API | Azure Container Apps 或 App Service | 对外提供 `/api/v1`，负责鉴权、业务规则、AI 代理和审计 |
| PostgreSQL | Azure Database for PostgreSQL Flexible Server | 健康档案、目标、计划和记录的唯一事实源 |
| AI | CloudBase AI Gateway/混元，或 GLM 视觉 API | 只由 API 服务端调用；小程序不保存 Key |
| 微信生态 | CloudBase + 微信公众平台 | 微信身份、可选私有对象存储和静态托管 |
| 静态素材/CDN | CloudBase 静态托管或 Cloudflare R2 + CDN | 承载原始水彩插画，避免进入小程序代码包 |

Cloudflare Workers 可以作为 API 的边缘反向代理，但不是必须项，也不能替代微信登录或 PostgreSQL。

## 服务端环境变量

以 `apps/api/.env.example` 为模板，在生产平台配置 `DATABASE_URL`、`API_PORT`、`AUTH_TOKEN_SECRET`、`WECHAT_APP_ID`、`WECHAT_APP_SECRET`、`CLOUDBASE_AI_BASE_URL`、`CLOUDBASE_AI_API_KEY`、`CLOUDBASE_AI_VISION_BASE_URL`、`CLOUDBASE_AI_VISION_API_KEY`、`CLOUDBASE_AI_TEXT_MODEL` 和 `CLOUDBASE_AI_VISION_MODEL`。

真实值不能写入 `apps/mini`、`dist`、日志或 GitHub Actions 文件。

## API 发布

```powershell
npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npx tsc -p packages/domain/tsconfig.build.json
npx tsc -p apps/api/tsconfig.build.json
```

将 `apps/api/dist`、`packages/domain/dist` 与生产依赖一起部署到 Node.js 服务，或直接使用包含整个仓库依赖的容器镜像；启动入口为 `apps/api/dist/main.js`。发布后访问 `GET /health`，响应应包含 `data.status = "ok"`（同时会返回请求 ID 元数据）。生产环境禁止使用 `dev-*` token。

Azure 首次部署顺序：创建 PostgreSQL Flexible Server -> 配置 API 环境变量 -> 部署 API -> 执行迁移 -> 配置 HTTPS 自定义域名 -> 检查 `/health` 和日志。数据库防火墙只放行 API 所在网络，`AUTH_TOKEN_SECRET` 使用随机长字符串并定期轮换。

序序相机当前把压缩后的临时照片以 Base64 发给 `/food-recognition/analyze`。服务端请求体上限为 8 MB，识别任务和候选结果会写入 PostgreSQL，只有用户确认后才生成饮食记录。以后如需保存原始用户照片，再接入私有对象存储；当前识别闭环不以对象存储为前置条件。

## 小程序发布

原始水彩插画总量超过微信代码包限制，不得直接随包发布，也不要为了过审降低画质。先导出原图并按原目录上传到 CloudBase 静态网站托管或其他 HTTPS CDN：

```powershell
node scripts/export-mini-assets.mjs
```

上传目录是 `dist/mini-assets`。例如 `dist/mini-assets/static/illustrations/hero.jpg` 对外地址应为 `https://素材域名/heban/static/illustrations/hero.jpg`。在微信公众平台把素材域名加入下载合法域名。

然后在 PowerShell 设置生产地址并构建：

```powershell
$env:VITE_MINI_API_BASE_URL='https://你的-api-域名/api/v1'
$env:VITE_MINI_ASSET_BASE_URL='https://你的素材域名/heban'
./scripts/build-mini.ps1
```

构建会把位图地址改为 HTTPS，保留 SVG 小图标在包内，并在超过 4 MB 时直接失败。原始图片只从构建产物中剔除，不会压缩或删除 `assets/illustrations` 中的源文件。

微信开发者工具导入 `apps/mini/dist/build/mp-weixin`。本地 AppID 只放在被忽略的 `project.private.config.json`。提交审核前检查网络请求合法域名、隐私政策、相机权限说明、用户数据删除入口和 AI 内容安全提示。

### CloudBase/Cloudflare 素材托管选择

两种方案对小程序来说都是公开 HTTPS 地址：

1. CloudBase 静态网站托管：当前已上传到 `https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban`，适合已经在腾讯云登录、希望同一控制台管理素材的情况。
2. Cloudflare R2 + CDN：适合需要全球缓存或已有 Cloudflare 域名的情况。R2 Bucket 保持私有，使用只读 CDN 域名暴露插画目录，不要把管理 Token 写入仓库。

无论选择哪种方案，都要把最终素材域名加入微信公众平台的 `downloadFile`/`request` 合法域名，并用真机验证图片加载、缓存和失败占位。

## 上线前验收

- 建档、体重、饮食、运动和睡眠记录在已接入的服务端环境中可以新增、修改、删除并在刷新后保留；饮水、心情、经期、用药和轻断食当前为本机保存，跨设备同步需后续补齐对应 API。
- 序序聊天在 API 正常和模型超时两种情况下都有明确反馈。
- 序序相机只把识别结果作为候选，用户确认后才保存食物记录。
- 真实微信用户之间的数据互相隔离。
- 生产数据库已完成备份和迁移演练。
- 小程序包不包含 `.env`、API Key、`dist/dev` 或调试日志。

## 上线后最小运维

- 每日备份 PostgreSQL，至少保留一份异地备份；迁移前先在测试库演练。
- 监控 API `/health`、5xx、AI 超时和数据库连接数；告警不要只依赖开发者电脑。
- 记录发布版本、数据库迁移编号和素材域名，回滚时先回滚 API 镜像，再处理数据库迁移。
- 规划中的彻底删除能力需要同时删除 PostgreSQL 记录、AI 审计摘要和（若未来启用）CloudBase/R2 原图；当前识别流程不保存原始图片。
