# 身份认证边界

阶段 0 定义身份 Provider 接口与受保护 API，但不接入真实微信登录。真实微信登录必须在取得小程序 AppID、AppSecret、服务端回调配置和隐私合规确认后实现。

开发和自动化测试可以使用 `Bearer dev-<user-id>` 临时 token 验证接口隔离；生产环境必须拒绝此类 token。客户端提交的 `userId`、`profileId` 或其他资源归属字段不能决定数据访问范围，服务端只使用认证上下文中的 userId。

健康档案当前采用内存 repository 验证模块与授权边界。Prisma 引擎可用后，它会替换为 PostgreSQL repository，接口路径、授权规则和返回 envelope 保持不变。
