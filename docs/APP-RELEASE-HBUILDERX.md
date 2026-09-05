# 和生序 App 双端发布指南

和生序客户端是 uni-app 工程。微信小程序和 Android/iOS App 共用页面、业务规则和生产 API，但三个发布平台的登录、签名和审核要求不同。

## 先看结论

- **小程序**：生产 API、数据库、AI、静态素材 CDN 和微信服务器域名已经配置完成。还需要用微信开发者工具上传 `apps/mini/dist/build/mp-weixin`，提交审核；备案审核通过后才能正式发布。
- **Android App**：可以使用 HBuilderX 云打包；App 账号注册/登录链路已加入，仍需 Android 包名、签名证书和真机验收。
- **iOS App**：可以使用 HBuilderX 云打包；仍需 Apple Developer 账号、Bundle ID、证书、描述文件和 TestFlight 验收。

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

当前 API 同时提供两套登录流程：微信小程序使用 `jscode2session`，App 使用邮箱和密码注册/登录。App 注册成功后需要再次登录，服务端以安全哈希保存密码，并复用 access token / refresh token。不能把“能打出 APK/IPA”当成“App 已完成真机验收”。

## 三、HBuilderX 云打包

1. 在 HBuilderX 打开 `apps/mini`。
2. 在仓库根目录运行 `npm --prefix apps/mini run clean:source-assets`，确认同步给微信开发工具的临时位图已经从源码目录移除。原图仍在 `assets/`，不会降低画质或丢失。
3. 选择“发行 -> 原生 App-云打包”。
4. 选择 Android、iOS 或两者。
5. 填写应用名称、版本号和版本编码，确认应用图标与启动图。
6. Android 填写包名和签名证书；iOS 选择 Bundle ID、证书和描述文件。
7. 在权限说明中填写相机用途，不能只勾选权限而不说明用途。
8. 点击打包，完成后下载 APK；iOS 包上传到 TestFlight 进行测试。

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

## HBuilderX 5.x 40% 自动退出排查

如果云打包在约 40% 处直接结束，先不要反复更换证书。HBuilderX 5.x 在部分 Vue 3 CLI 项目中会调用 `uni build` 时漏传 App 平台参数，导致编译器默认构建 H5，最后生成只有 `manifest.json` 的空 wgt。

仓库已在 `apps/mini/package.json` 的 `postinstall` 中安装兼容补丁。修复后应满足：

1. 完全退出并重新打开 HBuilderX。
2. 从 HBuilderX 项目列表移除后，重新导入 `apps/mini` 源码目录（不要导入 `dist`）。
3. 重新选择“发行 -> 原生 App-云打包”。
4. 若仍失败，查看 HBuilderX 控制台：不应再出现只生成 `dist/build/h5` 或 444 字节 wgt；本地 `npm run build:app` 应输出 `dist/build/app`。

如果停在 40% 且没有进入编译，首先检查 HBuilderX 上传的是源码目录而不是已精简的 App 产物。仓库已经把原始插画和位图图标移到 `assets/`：`apps/mini` 去掉 `node_modules` 与 `dist` 后约 1.33 MB，本地 `dist/build/app` 约 1.79 MB。不要把 `dist` 或同步后的 60 MB 位图缓存交给云打包。生产构建会将位图引用改为 CloudBase HTTPS 地址；原图没有压缩，也没有删除。

## 当前阻塞项

### HBuilderX 停在约 40% 或直接退出

先看 `C:\Users\\<用户名>\\AppData\\Roaming\\HBuilder X\\.log` 的最后一次打包记录。若出现下面两类日志：

```text
https://app.liuyingyong.cn/app/checkPromotion ... connect to server timeout
https://app.liuyingyong.cn/build/status ... connect to server timeout
```

说明请求还没有到达项目编译阶段，是 HBuilderX 到 DCloud 云打包服务的网络或代理超时。此时重复修改项目代码、图片和签名不会改变结果。请先在浏览器打开 `https://app.liuyingyong.cn` 验证网络，关闭系统代理/VPN 后重试；如果所在网络拦截该域名，换手机热点或家庭网络，并在 HBuilderX 偏好设置中清除错误代理配置。确认 `.log` 不再出现 `connect to server timeout` 后，再重新提交云打包。

如果网络检查通过，但日志仍然是：

```text
compiler compile cresult.success: true
manifest false
```

这属于 HBuilderX 5.24 对 Vite/uni CLI 项目的资源交接兼容问题。项目已经保留 App 平台兼容补丁，并提供 CLI 打包入口；可以使用 HBuilderX 安装目录下的 `cli.exe pack`，参数参见官方文档：https://hx.dcloud.net.cn/cli/pack。CLI 与图形界面使用同一账号和证书，不需要把密钥写入仓库。

App 目前属于“源码可打包、商店未发布”状态。账号注册/登录代码已完成；要达到可上架状态，还需要准备 Android/iOS 签名资料、完成隐私与权限材料，并完成真机验收。对应清单见 `docs/RELEASE-CHECKLIST.md`。
