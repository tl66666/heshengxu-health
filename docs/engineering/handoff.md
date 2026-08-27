# 和生序项目交接说明

## 项目定位

和生序是微信小程序优先的健康管理产品，核心用户覆盖减脂与体重管理、睡眠与精力、力量与体能、饮食与活力、情绪与压力等方向。序序是规则化的健康陪伴入口，提供生活方式参考，不做疾病诊断或治疗决策。

## 当前技术架构

- 前端：`apps/mini`，uni-app + Vue 3 + TypeScript，先发布微信小程序，后续复用到 App。
- API：`apps/api`，NestJS + Prisma。
- 数据库：PostgreSQL；Redis 预留给缓存和异步任务。
- 共享领域：`packages/domain`、`packages/contracts`。
- CloudBase：后续用于微信身份、私有对象存储和服务端混元调用，不作为第二套业务数据库。
- Docker：只用于本地 PostgreSQL/Redis/API 联调；上线后由云平台托管，不要求用户电脑常开。

## 已完成能力

1. 阶段 0：工程目录、质量门禁、NestJS API、Prisma、uni-app 构建。
2. 阶段 0.5：健康档案持久化、用户隔离、记录版本化、AI 安全审计基础。
3. 阶段 1：建档锁定、BMI 实时反馈、身高体重输入、多目标选择、本地保存兜底。
4. 阶段 2A：首页、记录、计划、序序聊天、我的页和五栏导航。
5. 食品闭环：食品搜索、份量确认、营养计算、餐食编辑/删除、周回顾、拍照识别 Mock、候选确认和失败重试。
6. GitHub CI：格式化、Lint、类型检查、迁移与种子、API 构建、小程序测试和微信构建产物检查均已接入。

## 当前未完成能力

- 微信真实登录和身份会话。
- CloudBase 私有对象存储生产适配器。
- 混元视觉生产 Provider、授权提示、审计和失败降级。
- 数据导出、彻底删除和隐私设置。
- 390x844 与 430x932 真机视觉验收、微信审核前检查。

## 推荐执行顺序

1. 先逐页验收前端：健康档案、编辑档案、周回顾、我的页，检查图片比例、文字溢出、返回路径、底部导航和空/错/加载状态。
2. 接入微信登录，服务端将演示身份替换为真实用户身份；小程序不保存服务端密钥。
3. 接入 CloudBase 私有对象存储，上传会话只由服务端签发。
4. 接入混元视觉 Provider。识别输出始终是候选列表，用户确认后才创建 `MealEntry`。
5. 补齐隐私导出/删除，再进行全量真机验收和部署。

## 验证命令

```powershell
pnpm install --frozen-lockfile
pnpm --filter @heban/mini test
pnpm --filter @heban/mini typecheck
pnpm --filter @heban/mini build:mp-weixin:check
pnpm check
pnpm test
```

微信开发者工具日常导入 `apps/mini`，发布预览导入 `apps/mini/dist/build/mp-weixin`。不要导入 `src`，也不要提交 `dist`。

## 重要安全约束

公开仓库不包含个人 AppID、AppSecret、CloudBase/Tencent/Azure 凭据或模型 Key。参考仓库只用于字段和信息架构研究，不复制没有明确授权的代码、图片或数据库。
