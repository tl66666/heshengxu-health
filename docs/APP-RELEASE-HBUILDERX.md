# 和生序 App 双端发布指南

`apps/mini` 是 uni-app 工程，小程序和 App 共用同一套页面、状态和 API。微信小程序继续用微信开发者工具验收；Android/iOS 使用 HBuilderX 云打包。

## 发布前准备

- 安装 HBuilderX（建议使用稳定版）并登录 DCloud 账号。
- 生产 API 必须是 HTTPS，例如 `https://api.example.com/api/v1`。
- 远程插画必须是 HTTPS，并在小程序后台加入合法域名；App 不受微信合法域名限制，但仍建议统一使用 HTTPS。
- Android 准备应用包名和签名证书；iOS 准备 Apple Developer 账号、Bundle ID、证书和描述文件。

## Android/iOS 云打包

1. HBuilderX 打开仓库中的 `apps/mini`，确认 `manifest.json` 的应用名称、版本号和图标。
2. 选择“发行 -> 原生 App-云打包”。首次使用先按向导创建 Android 签名，iOS 则上传自己的证书和描述文件。
3. 选择 Android、iOS 或两者，填写包名、版本号和必要的权限说明。相机功能需要保留相机权限，并在隐私说明中解释图片用途。
4. 点击打包并等待云端构建。构建完成后下载 APK/IPA 或使用 TestFlight 分发。
5. 用真实设备检查登录、建档、体重、饮水、饮食、运动、睡眠、心情、经期、用药、序序聊天和序序相机。

## 与微信小程序的区别

- 小程序入口和底部导航保持不变；App 使用同一套页面路由，但不需要导入 `dist/build/mp-weixin`。
- App 不能依赖微信专属登录状态。正式发布前需要在 API 增加手机号、邮箱或 Apple/Google 等 App 身份登录，并在客户端选择对应登录方式。
- App 发布包不能包含 `.env`、CloudBase/Tencent/Azure Secret、模型 Key 或数据库密码。

## 版本和回滚

每次发布记录：应用版本号、API 镜像版本、数据库迁移编号和素材域名。若只改前端，重新云打包即可；若改 API，先部署兼容版本并验证 `/health`，再在 HBuilderX 发布新包。不要通过回滚 App 来回滚已经执行的数据库迁移。
