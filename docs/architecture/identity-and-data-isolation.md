# 身份与数据隔离方案

更新时间：2026-08-30

## 结论

小程序使用微信登录作为身份 Provider，App 复用同一套 API 和 token。未登录用户仍可体验本地计划；登录成功后，游客计划迁移到账号空间。服务端永远从 access token 的 `sub` 读取 `userId`，不信任客户端传入的归属字段。

## Token 生命周期

- access token：15 分钟，HMAC-SHA256 签名，仅存客户端本地缓存。
- refresh token：30 天，服务端只保存 SHA-256 hash，可撤销、可按设备记录。
- 退出登录：撤销 refresh session，清理客户端 access/refresh/userId。
- 生产环境必须设置随机 `AUTH_TOKEN_SECRET`，并拒绝 `dev-*` token。

## 小程序与 App

| 端 | 登录方式 | 账号来源 |
| --- | --- | --- |
| 微信小程序 | `wx.login()` code | 微信 `openid`，保存到 `ExternalIdentity` |
| Android/iOS App | 首期微信登录，随后手机号验证码 | 同一 `User`，新增 Provider 不改变业务表 |
| 游客 | 不登录 | 仅本地数据，不能跨设备同步 |

## 本地计划迁移

- 游客 key：`heban.local.habit-plans.guest.v1`
- 用户 key：`heban.local.habit-plans.user.{userId}`
- 登录成功后按计划标题去重合并，保留游客和云端已有数据。
- 退出登录后新建计划回到游客空间，不会读取上一个账号的数据。

## 必须保留的边界

- AppSecret 只存在 API 环境变量，不能进入小程序、Git 或日志。
- 业务接口不接受客户端 `userId` 作为授权依据。
- 生产部署前完成微信隐私协议、账号注销、数据删除和导出流程。
