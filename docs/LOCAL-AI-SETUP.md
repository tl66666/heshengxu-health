# 本地 AI 开发环境

序序聊天和序序相机的密钥只由后端读取，放在 `apps/api/.env`，不要写进小程序代码或提交到 Git。

## 第一次启动

1. 确认 Docker Desktop 已启动。
2. 双击仓库根目录的 `start-dev.bat`。
3. 在微信开发者工具中导入 `apps/mini/dist/dev/mp-weixin`。

脚本会尝试启动本地 PostgreSQL、Redis 和 API；如果 Docker 没有安装，先手动启动这两个服务，再运行 API：

```powershell
cd apps/api
node dist/main.js
```

小程序默认请求 `http://localhost:3000/api/v1`，开发令牌由本地运行时自动提供。生产环境必须改用正式登录令牌和安全的环境变量配置。

## 配置项

`apps/api/.env` 至少需要：

- `CLOUDBASE_AI_BASE_URL`
- `CLOUDBASE_AI_API_KEY`
- `CLOUDBASE_AI_TEXT_MODEL`
- `CLOUDBASE_AI_VISION_BASE_URL`
- `CLOUDBASE_AI_VISION_API_KEY`
- `CLOUDBASE_AI_VISION_MODEL`

当前文本模型使用 `hy3`，图片识别使用 GLM 视觉模型。修改配置后重启 API 才会生效。

## 快速检查

```powershell
Invoke-RestMethod http://localhost:3000/health
```

聊天接口需要开发授权头：

```powershell
$body = @{ messages = @(@{ role = 'user'; content = '给我一个今天能完成的健康小建议' }) } | ConvertTo-Json -Depth 5
Invoke-RestMethod http://localhost:3000/api/v1/xuxu/chat -Method Post -Headers @{ Authorization = 'Bearer dev-mini-user' } -ContentType 'application/json' -Body $body
```
