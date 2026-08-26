# 和生序代码库治理规范

## 目标

让一个刚加入项目的开发者能在 10 分钟内找到正确的入口、知道文件应该放在哪里，并且不会误把 Demo、构建产物或密钥提交到仓库。

## 顶层边界

```text
apps/mini/       uni-app 小程序源码与微信构建配置
apps/api/        NestJS API、Prisma 数据库和业务模块
packages/        前后端共享 contracts、领域规则和构建配置
assets/          唯一图片源目录
prototypes/      只读产品原型，不参与生产构建
infra/           Docker 与本地基础设施
docs/            产品、架构、工程规范和阶段计划
scripts/         可重复执行的开发/构建/校验脚本
```

禁止在仓库根目录新增页面、接口、图片、临时脚本或零散说明文档。

## 小程序源码边界

```text
apps/mini/src/
  pages/          路由页面，只负责页面组合、事件和展示
  components/     跨页面 UI 组件与纯展示组件
  features/       按业务域组织的状态、服务和展示模型
  services/       通用 API transport，不放业务判断
  stores/         跨页面流程状态（当前仅建档）
  static/icons/   业务图标源
  static/illustrations/ 构建同步缓存，不手工维护、不提交
  App.vue         全局页面基础样式
  pages.json      uni-app 路由和 Tab 注册唯一入口
```

页面不得直接拼接 API URL、访问 Prisma、复制另一页面的业务规则。新增业务必须先进入 `features/<domain>`，页面只调用该域公开的 service/store API。

## API 源码边界

```text
apps/api/src/
  common/         跨模块 HTTP、数据库和异常基础设施
  modules/<domain>/ controller、dto、service、repository、module
```

模块之间通过 service 或 contracts 交互，不直接访问另一个模块的 repository。AI 相关请求必须经过安全校验与审计模块，不能在小程序端放 API key。

## 依赖方向

```text
pages -> components/features -> services -> packages/contracts
api modules -> packages/domain + packages/contracts
packages/domain -> no framework / no network
prototypes -> assets only
```

禁止反向依赖：`packages` 不得导入 `apps`；页面不得导入 API 内部文件；原型不得被生产入口导入。

## 资源和构建产物

- 图片唯一源目录是 `assets/illustrations/`。
- `apps/mini/src/static/illustrations/` 是同步缓存，不手工修改。
- `apps/mini/dist/dev` 和 `apps/mini/dist/build` 是构建产物，不提交。
- `.env`、`project.private.config.json`、日志、`node_modules`、临时 worktree 不提交。
- `static/icons` 中只放确定会被页面引用的标准图标，不放未使用的图标包。

## 阶段开发规则

每个阶段只解决一个可验收模块，必须包含：设计文档、实施计划、源码、最小测试、构建验证和单独 Git 提交。阶段之间不跨模块顺手重构。
