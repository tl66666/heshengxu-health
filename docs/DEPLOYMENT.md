# 和生序上线清单

这份清单用于第一次部署正式 API 和微信小程序。密钥只配置在部署平台的环境变量中，不写入仓库，也不放进小程序包。

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

将 `apps/api/dist` 与生产依赖部署到 Node.js 服务，启动入口为 `apps/api/dist/main.js`。发布后访问 `GET /health`，应返回 `{"data":{"status":"ok"}}`。生产环境禁止使用 `dev-*` token。

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

## 上线前验收

- 建档、体重、饮水、饮食、运动、睡眠、心情和经期记录可以新增、修改、删除并在刷新后保留。
- 序序聊天在 API 正常和模型超时两种情况下都有明确反馈。
- 序序相机只把识别结果作为候选，用户确认后才保存食物记录。
- 真实微信用户之间的数据互相隔离。
- 生产数据库已完成备份和迁移演练。
- 小程序包不包含 `.env`、API Key、`dist/dev` 或调试日志。
