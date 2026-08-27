# 微信云开发准备清单

## 当前边界

部署目标以 [ADR-005](../architecture/adr-005-target-runtime-and-deployment.md) 为准：NestJS 和 PostgreSQL 将部署到 Azure；CloudBase 不承载第二套健康业务数据库。

和生序当前以 NestJS + PostgreSQL 作为唯一业务后端：健康档案、计划、饮食记录和 AI 审计都由它保存。微信云开发不会再建立第二套业务数据库。

本阶段接入微信云开发的目标只有两个：

1. 为用户拍摄的食物图片提供受控对象存储。
2. 让服务端调用混元视觉模型，得到待用户确认的食物候选项。

小程序不保存腾讯云密钥，也不直接调用混元。图片识别结果必须由用户确认后，才会写入饮食记录。

## 先在控制台完成的准备

1. 打开腾讯云开发控制台并进入本项目环境。当前记录的环境 ID 是 `tl-d2ghzbl1p09ccaae3`；若控制台显示的环境 ID 不同，以控制台为准。
2. 确认环境的地域，并启用云存储。图片只保存到私有目录 `food-recognition/`，不要配置公开读。
3. 在腾讯云控制台的访问管理中，为服务端创建一个最小权限的子账号或临时凭证。它只应拥有此 CloudBase 环境的文件上传、临时下载地址和混元调用权限。
4. 在混元服务页确认视觉理解能力已开通，后续实现使用图片问答能力，而不是把图片直接发送到客户端模型。
5. 记录环境 ID；密钥只保存在本机或部署平台的环境变量中，不能发到聊天、提交到 Git，也不能写进 `apps/mini`。

## 本地配置时机

当前运行时尚未部署 CloudBase 存储适配器和混元 Provider。因此在适配器提交前，`.env` 必须保持默认 mock 配置，不能提前设置以下两个变量：

```dotenv
FOOD_RECOGNITION_STORAGE_PROVIDER=cloudbase
FOOD_RECOGNITION_VISION_PROVIDER=hunyuan
```

提前启用它们会让 API 拒绝启动，这是为避免看似可用、实际没有真实存储或识别能力的假接入。

实现完成后，本机 `.env` 才加入下面的值。只填写真实值，不要提交 `.env`：

```dotenv
FOOD_RECOGNITION_STORAGE_PROVIDER=cloudbase
FOOD_RECOGNITION_VISION_PROVIDER=hunyuan
CLOUDBASE_ENV_ID=tl-d2ghzbl1p09ccaae3
TENCENTCLOUD_SECRET_ID=你的服务端密钥 ID
TENCENTCLOUD_SECRET_KEY=你的服务端密钥 Key
```

## 后续接入顺序

1. 服务端实现 CloudBase 私有对象存储：上传、图片哈希、短期下载 URL 和按用户隔离。
2. 服务端实现混元视觉 Provider：只接受服务端生成的临时图片 URL，严格归一化模型输出。
3. 小程序改为真实上传图片并传回上传会话 ID；仍然不接触密钥。
4. 用测试环境的一张食物照片验证“授权 -> 上传 -> 识别候选 -> 用户确认 -> 记入一餐”的完整链路。
5. 部署时把同样的变量配置在云托管或云函数环境，不复制到前端构建产物。

## 与 Docker 的关系

Docker 只用于本机运行 PostgreSQL 和 Redis，方便 NestJS API 联调。微信云开发的云存储和混元服务上线后，不要求用户电脑运行 Docker；但如果继续在本机启动 NestJS API，本地数据库仍需要 Docker。
