# 和生序 App 双端发布指南

和生序客户端是 uni-app 工程。微信小程序和 Android/iOS App 共用页面、业务规则和生产 API，但三个发布平台的登录、签名和审核要求不同。

## 先看结论

- **小程序**：生产 API、数据库、AI、静态素材 CDN 和微信服务器域名已经配置完成。还需要用微信开发者工具上传 `apps/mini/dist/build/mp-weixin`，提交审核；备案审核通过后才能正式发布。
- **Android App**：可以使用 HBuilderX 云打包，但当前还缺 Android 包名、签名证书和 App 端登录方案验收。
- **iOS App**：可以使用 HBuilderX 云打包，但当前还缺 Apple Developer 账号、Bundle ID、证书、描述文件和 TestFlight 验收。

## 一、安装与打开项目

1. 安装 HBuilderX 稳定版并登录 DCloud 账号。
2. 选择“文件 -> 打开目录”，打开项目中的 `apps/mini`。
3. 项目入口和应用信息在 `apps/mini/src/manifest.json`。
4. 生产 API 必须使用 HTTPS；App 不受微信合法域名限制，但仍统一使用生产 HTTPS 地址。

不要把 `apps/mini/dist/build/mp-weixin` 导入 HBuilderX。它是微信开发者工具的发布包；HBuilderX 打包使用 `apps/mini` 源码目录。

## 二、打包前准备

### Android

- 申请并固定正式包名，例如 `com.example.heshengxu`。包名一旦发布不要随意更改。
- 准备 Android 签名证书（keystore）、证书别名和密码。
- 准备应用图标、启动图、隐私政策 URL 和相机权限说明。
- 在真机上验证登录、建档、体重、饮食、序序聊天、序序相机和记录保存。

### iOS

- 注册 Apple Developer Program。
- 在 Apple Developer 中创建 Bundle ID。
- 创建发布证书和 App Store 描述文件。
- 准备 App 隐私详情、相机用途说明、隐私政策 URL 和 TestFlight 测试账号。

### 账号登录差异

当前 API 的登录接口是微信小程序 `jscode2session` 流程。App 不能直接复用小程序 code；正式 App 发布前必须增加并验收 App 端登录方式，例如手机号/邮箱登录，或独立的微信 App OAuth 流程。不能把“能打出 APK/IPA”当成“App 登录已经完成”。

## 三、HBuilderX 云打包

1. 在 HBuilderX 打开 `apps/mini`。
2. 选择“发行 -> 原生 App-云打包”。
3. 选择 Android、iOS 或两者。
4. 填写应用名称、版本号和版本编码，确认应用图标与启动图。
5. Android 填写包名和签名证书；iOS 选择 Bundle ID、证书和描述文件。
6. 在权限说明中填写相机用途，不能只勾选权限而不说明用途。
7. 点击打包，完成后下载 APK；iOS 包上传到 TestFlight 进行测试。

## 四、发布前验收

在真实设备上逐项操作并记录结果：

- 首次启动、登录、退出和重新登录。
- 建档、BMI、体重目标和体重记录编辑。
- 饮食搜索、序序相机识别、用户确认和记录保存。
- 饮水目标、运动、睡眠、心情、生理期、用药和轻断食。
- 网络断开、AI 超时、图片识别失败和服务端 5xx 时的提示。
- 数据删除入口、隐私政策链接和相机权限弹窗。

## 五、禁止事项

- 不把 `.env`、API Key、数据库密码、微信 AppSecret 或 Azure/CloudBase Secret 打进 App 包。
- 不把微信小程序发布包当作 App 源码导入 HBuilderX。
- 不在没有真实设备测试的情况下提交商店审核。
- 不把小程序的微信登录 code 当作 App 登录凭证。

## 当前阻塞项

App 目前属于“源码可打包、商店未发布”状态。要达到可上架状态，还需要确定 App 登录方案、准备 Android/iOS 签名资料、完成隐私与权限材料，并完成真机验收。对应清单见 `docs/RELEASE-CHECKLIST.md`。
