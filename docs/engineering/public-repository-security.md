# 公开仓库安全与本地配置规范

## 目标

GitHub 仓库只保存源码、模板和不含个人凭据的示例配置。微信 AppID、AppSecret、CloudBase 环境密钥、腾讯云 Secret、Azure 凭据、模型 Key 和数据库密码都不能提交。

## 微信小程序配置

- `apps/mini/src/manifest.json` 的 `mp-weixin.appid` 保持空字符串。
- `apps/mini/project.config.json` 是公开模板，`appid` 保持空字符串。
- 个人开发者工具配置放在 `apps/mini/project.private.config.json`，该文件已被 `.gitignore` 忽略。
- 微信开发者工具只导入 `apps/mini`；开发和发布产物位于被忽略的 `dist/` 目录。

首次在本机使用时，复制模板并在本地填写 AppID：

```powershell
Copy-Item apps/mini/project.config.json apps/mini/project.private.config.json
```

然后只修改 `project.private.config.json`，不要修改或提交公开模板。AppID 是项目标识，不等同于 AppSecret；如果 AppSecret 或其他密钥曾经泄露，必须在对应平台立即轮换。

## 服务端配置

服务端变量只从 `.env`、部署平台 Secret 或 CI Secret 读取。仓库只保留 `.env.example` 和 `apps/api/.env.example` 的变量名，不填写真实值。小程序构建中只能出现公开 HTTPS API 地址，不能出现任何服务端密钥。

## 提交前检查

```powershell
git status --short
git diff --check
git ls-files | Select-String '\.env$|project\.private\.config|\.log$|dist/|node_modules/'
git grep -n -I -E 'wx[a-f0-9]{16,}|sk-[A-Za-z0-9]{20,}|APP_SECRET|SECRET_KEY|ACCESS_TOKEN' -- ':!pnpm-lock.yaml'
```

命令不得输出真实值。发现历史泄露时，先轮换凭据，再清理 Git 历史并强制更新远程分支；仅删除当前文件不能消除历史提交中的泄露。

## GitHub 告警处理

Secret Scanning 告警关闭前，确认三件事：公开文件已经是模板、历史对象中不再包含真实值、对应平台的凭据已经轮换。AppID 告警也按同样流程处理，避免开发工具配置被误提交。
