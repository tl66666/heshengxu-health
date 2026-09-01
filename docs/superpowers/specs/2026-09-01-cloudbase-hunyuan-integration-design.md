# CloudBase 成长计划 AI 接入设计

## 目标

把 CloudBase 小程序成长计划提供的 AI 额度接入和生序项目的两个真实功能：

1. 序序聊天使用 CloudBase `hy3` 文本模型。
2. 序序相机识别真实食物图片，返回可核对的候选、分量和营养估算；只有用户确认或修改后，才写入现有饮食记录和食物库。

## 约束

- CloudBase Gateway 地址配置为 `https://tl-d2ghzbl1p09ccaae3.api.tcloudbasegateway.com/v1/ai/cloudbase`。
- API Key 只允许存在于服务端环境变量 `CLOUDBASE_AI_API_KEY`，不得进入 `apps/mini`、构建产物或 Git。
- 文本模型默认 `hy3`。图片模型默认 `glm-5v-turbo`，因为它支持图片 Base64/URL；可通过环境变量切换为控制台已开通的兼容视觉模型。
- AI 结果是建议，不是医学诊断或确定营养事实。无法识别、图片过大、模型额度耗尽时必须返回可理解的失败状态。
- 食物图片不伪造上传完成状态。服务端只接受实际上传的图片数据或可访问的临时对象；当前未部署 CloudBase 对象存储时，开发环境继续使用明确的本地/测试适配器。

## 推荐架构

小程序 -> NestJS API -> CloudBase AI Gateway -> 结构化解析 -> 现有食物候选/确认页 -> MealEntry/PostgreSQL。

聊天请求由新增的 AI 聊天服务转发到 Gateway，携带受控的系统提示词和最近一小段对话。相机识别请求由服务端视觉 Provider 调用 Gateway，要求模型只返回 JSON；服务端校验字段、范围和候选数量后才建立识别任务。前端继续使用现有的候选页和 `/food-recognition/confirm`，不改变“确认后保存”的业务约束。

## 接口与数据流

### 序序聊天

- 新增 `POST /xuxu/chat`，请求为 `{ messages: [{ role, content }] }`。
- 服务端限制消息长度和历史条数，附加健康陪伴系统提示词：不做诊断、不指导处方用药，出现急症风险时建议及时就医。
- 返回 `{ message: { role: 'assistant', content }, model, usage? }`；原始供应商响应不直接返回给客户端。
- 小程序聊天组件改为真实请求，保留加载、超时、额度/服务不可用和重试状态；不再生成规则假回复。

### 序序相机

- 图片在小程序端压缩到服务端限制后上传；服务端保存临时对象并生成一次性识别任务。
- 视觉提示词要求返回最多 5 个候选，每个候选包含 `name`、`confidence`、`estimatedGrams`、`energyKcal`、`proteinG`、`fatG`、`carbohydrateG`，并明确说明是估算值。
- 结果先与现有 `FoodItem` 目录匹配；匹配不到的候选不自动创建食品或饮食记录，前端引导用户改用食物搜索/手动记录。
- 用户在候选/确认页选择候选、调整克重和餐次后，才调用现有确认接口创建真实 `MealEntry`。
- 识别任务、AI 审计和失败码继续沿用现有 Prisma 模型；日志只记录哈希、状态和模型，不记录 API Key、原图或完整模型响应。

## 配置

服务端 `.env`（不提交）：

```dotenv
CLOUDBASE_AI_BASE_URL=https://tl-d2ghzbl1p09ccaae3.api.tcloudbasegateway.com/v1/ai/cloudbase
CLOUDBASE_AI_API_KEY=从 CloudBase 控制台获取的 API Key
CLOUDBASE_AI_TEXT_MODEL=hy3
CLOUDBASE_AI_VISION_MODEL=glm-5v-turbo
```

如果控制台尚未开通视觉模型，聊天仍可单独使用；相机返回“视觉模型未开通/额度不足”，不会写入假数据。

## 错误处理

- `401/403`：提示管理员检查 CloudBase API Key 和环境权限。
- `429/EXCEED_CONCURRENT_REQUEST_LIMIT`：指数退避一次后返回稍后重试。
- `5xx`、超时或解析失败：任务标记为 `failed`，客户端显示改用食物目录记录。
- 模型返回非法 JSON、负数或异常克重：丢弃该候选并记录安全失败，不进入确认页。

## 测试与验收

- 单元测试：Gateway 请求体、认证头、模型响应解析、非法候选过滤、聊天失败映射。
- 服务测试：聊天不再走规则回复；相机识别成功只创建候选；未确认前不存在 `MealEntry`；确认后保存营养快照。
- 构建验收：`pnpm --filter @heban/api typecheck`、API 测试、`pnpm --filter @heban/mini typecheck` 和 MP-Weixin 构建。
- 真机验收：登录小程序，发送一条聊天消息；拍摄一张真实食物照片，核对候选和估算，修改克重后确认，回到饮食记录检查真实保存结果。
