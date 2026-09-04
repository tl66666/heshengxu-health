# 和生序生产部署

本文档描述当前生产环境的真实组成、部署顺序和安全边界。

## 当前生产资源

| 资源 | 当前值 |
| --- | --- |
| Azure 资源组 | rg-heshengxu-prod |
| PostgreSQL | psql-heshengxu-prod-tl |
| Container Apps 环境 | cae-heshengxu-prod |
| API Container App | api-heshengxu-prod |
| API 地址 | https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io |
| API 镜像 | GitHub Container Registry 公共镜像 |
| 素材 CDN | https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban |

当前 API 使用 0.5 CPU、1 GiB 内存，最小实例 0，最大实例 2。容器启动时执行 Prisma 迁移，健康检查为 /health。

## 服务边界

- uni-app 客户端只保存公开的 HTTPS API/CDN 地址。
- NestJS API 负责认证、业务规则、AI 代理和审计边界。
- PostgreSQL 是服务端业务数据的事实来源。
- CloudBase AI Gateway 提供混元文本模型调用。
- GLM 视觉 API 提供食物图片识别。
- CloudBase 静态托管/CDN 承载原始插画资源。
- Docker 负责可复现构建，GitHub Container Registry 负责镜像发布，Azure Container Apps 负责运行。

## 必需环境变量

以 apps/api/.env.example 为模板，在 Azure Secret/环境变量中配置：

- DATABASE_URL
- API_PORT
- AUTH_TOKEN_SECRET
- WECHAT_APP_ID
- WECHAT_APP_SECRET
- CLOUDBASE_AI_BASE_URL
- CLOUDBASE_AI_API_KEY
- CLOUDBASE_AI_TEXT_MODEL
- CLOUDBASE_AI_VISION_BASE_URL
- CLOUDBASE_AI_VISION_API_KEY
- CLOUDBASE_AI_VISION_MODEL
- FOOD_RECOGNITION_VISION_PROVIDER
- FOOD_RECOGNITION_STORAGE_PROVIDER

真实值不得写入仓库、镜像、小程序包、日志或文档。当前微信 AppSecret 已保存为 Azure Secret wechat-app-secret，并由 WECHAT_APP_SECRET 引用。

## API 镜像发布

GitHub Actions 的 API 镜像工作流会构建 Dockerfile.api 并推送到 GitHub Container Registry。生产部署必须使用不可变的提交标签或版本标签：

    docker build -f Dockerfile.api -t ghcr.io/tl66666/heshengxu-health/api:<tag> .
    docker push ghcr.io/tl66666/heshengxu-health/api:<tag>

Azure 更新镜像后等待新修订版就绪，再执行：

    curl.exe -sS https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io/health

期望响应包含 data.status = ok。

## 小程序生产构建

先上传 dist/mini-assets 到 CloudBase 静态托管，再设置公开构建变量：

    $env:VITE_MINI_API_BASE_URL='https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io/api/v1'
    $env:VITE_MINI_ASSET_BASE_URL='https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban'
    ./scripts/build-mini.ps1

构建产物为 apps/mini/dist/build/mp-weixin。原始插画保留在 assets/illustrations，不压缩或删除。

## 微信后台配置

微信公众平台的开发管理 -> 开发设置 -> 服务器域名应配置：

- request 合法域名：API 域名
- downloadFile 合法域名：素材域名

当前两项已保存并验证。正式上架还需要完成备案审核、隐私说明和版本审核。

## 本地 Docker

    docker build -f Dockerfile.api -t heshengxu-api:local .
    docker run --rm -p 3000:3000 --env-file apps/api/.env heshengxu-api:local

本地数据库可使用 infra/docker/docker-compose.yml。不要把生产数据库连接字符串用于本地开发。

## 数据与功能状态

服务端已保存并支持验证的能力包括健康档案、体重、饮食、运动和睡眠等已接入 API 的记录。饮水、心情、生理期、用药和轻断食当前以本机保存为主，跨设备同步尚未完成。序序相机不默认保存原始用户照片。

## 备份、监控与回滚

- 为 PostgreSQL 保留自动备份，并定期演练恢复。
- 监控 /health、5xx、AI 超时、数据库连接和 Azure 成本。
- 发布记录包含客户端版本、API 镜像标签、迁移编号和素材域名。
- 回滚 API 时先切换到上一版镜像，再评估数据库迁移兼容性。
- 不通过删除生产数据来回滚应用版本。
