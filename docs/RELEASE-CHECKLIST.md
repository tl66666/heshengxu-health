# 和生序发布检查清单

这份清单用于小程序和 App 正式发布前后的验收。每一项都要有可验证结果；没有完成的项目必须标记为未完成。

## 1. 仓库与构建

- [ ] 工作区没有未理解的改动。
- [ ] 未跟踪文件中没有 .env、API Key、数据库密码、AppSecret、日志或私有微信配置。
- [ ] Prettier、ESLint、TypeScript、Vitest 全部通过。
- [ ] Prisma schema 与迁移一致，迁移在干净 PostgreSQL 上演练通过。
- [ ] 小程序生产构建使用真实 HTTPS API/CDN 地址。
- [ ] apps/mini/dist/build/mp-weixin 小于微信代码包限制，并通过资源路径检查。

## 2. Docker 与 Azure

- [ ] Dockerfile.api 可以从仓库根目录构建。
- [ ] 容器启动时执行 Prisma migrate deploy。
- [ ] Azure Container Apps 使用明确的镜像版本，不使用未标记的 latest。
- [ ] Azure Database for PostgreSQL 可连接，备份和恢复策略已确认。
- [ ] API Secret 使用 Azure Secret 引用，不写入环境文件或镜像。
- [ ] /health 返回 data.status = ok。
- [ ] API 关键路径、错误响应、超时和容器日志已检查。
- [ ] 最小/最大实例数和预算告警符合个人项目预算。

## 3. AI 与素材

- [ ] CloudBase AI Gateway 文本模型可用，API Key 只在服务端。
- [ ] GLM 视觉模型可用，图片大小和请求体限制已验证。
- [ ] 食物识别结果保存前需要用户确认。
- [ ] CloudBase 静态素材 URL 返回 200，图片显示完整。
- [ ] 原始插画资源保留在 assets/illustrations，不压缩、不删除。
- [ ] 微信 request 合法域名包含 API 域名。
- [ ] 微信 downloadFile 合法域名包含素材域名。

## 4. 微信小程序

- [ ] 微信 AppID、AppSecret 和服务器域名配置完成。
- [ ] 隐私政策、用户数据删除入口和相机权限说明完成。
- [ ] 微信开发者工具导入 apps/mini/dist/build/mp-weixin 并真机测试。
- [ ] 建档、体重、饮食、序序聊天、序序相机、饮水、运动、睡眠、心情、生理期、用药和轻断食主流程可用。
- [ ] 明确记录哪些模块服务端保存，哪些模块当前只保存在本机。
- [ ] 提交审核前确认备案状态和类目符合发布要求。

## 5. HBuilderX App

- [ ] Android 包名、签名证书和应用图标准备完成。
- [ ] iOS Bundle ID、开发者账号、证书和描述文件准备完成。
- [ ] App 隐私政策、权限用途、相机说明和用户数据删除入口完成。
- [ ] Android/iOS 真机完成登录、建档、记录、AI 和图片识别验收。
- [ ] App 包不包含 .env、API Key、数据库密码或 Azure/CloudBase Secret。
- [ ] 生产 API 支持 App 端的认证方式，不依赖微信专属登录状态。

## 6. 发布后

- [ ] 记录版本号、API 镜像标签、数据库迁移编号和素材域名。
- [ ] 发布后再次检查 /health、AI 超时、数据库连接和 5xx。
- [ ] 观察 Azure 成本、实例数、数据库存储和日志。
- [ ] 保留可回滚的 API 镜像和上一版客户端包。
- [ ] 任何未完成能力在产品说明和审核材料中明确标注。
