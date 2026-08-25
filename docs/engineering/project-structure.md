# 项目结构规范

```text
apps/mini/                 uni-app 小程序源码
apps/mini/src/pages/       页面，只负责页面展示和交互
apps/mini/src/services/    API 请求层，不放业务规则
apps/mini/src/stores/      跨页面流程状态
apps/api/                  NestJS 服务端
apps/api/src/modules/      按业务域拆分的模块
packages/contracts/        前后端共享的接口信封和错误码
packages/domain/           不依赖框架的健康规则，例如 BMI
infra/docker/              PostgreSQL、Redis 本地基础设施
prototypes/web-demo/       只用于探索的静态原型
docs/                      产品、架构、开发和验收说明
scripts/                   可重复执行的工程脚本
```

## 小程序导入

日常开发在仓库根目录执行：

```powershell
pnpm install
./scripts/dev-mini.ps1
```

然后在微信开发者工具中导入 `apps/mini`。项目配置会自动把微信端根目录指向 `apps/mini/dist/dev/mp-weixin`，其中必须存在由 uni-app 生成的 `app.json`。源码保存后点击微信工具的“重新编译”即可更新。

发布预览前运行 `./scripts/build-mini.ps1`，再直接导入 `apps/mini/dist/build/mp-weixin`。不要导入仓库根目录，也不要手工创建或修改构建目录里的 `app.json`。

## 配置边界

- 微信 AppID 只填入微信开发者工具的本地项目配置或 `manifest.json` 的开发配置。
- 微信 AppSecret、AI API key、数据库密码不能进入源码、README、CI 或小程序包。
- 业务字段先在 `packages/contracts` 定义，BMI 等纯规则放在 `packages/domain`。
- 页面不得直接访问数据库或拼装服务端内部对象。
