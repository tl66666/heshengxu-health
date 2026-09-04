# 和生序 · 开发交接文档

> 交接时间：2026-09-03 · 交接范围：`apps/mini` 微信小程序端视觉与功能重构、仓库环境修复、`apps/api` 配套改动
> 面向对象：下一位接手的开发者（人类或 AI）

---

## 1. 项目概览

pnpm monorepo（`pnpm-workspace.yaml`：`apps/*`、`packages/*`）：

| 目录 | 说明 |
| --- | --- |
| `apps/mini` | 微信小程序（uni-app Vue3 + TS），**本次交接的重心** |
| `apps/api` | NestJS + Prisma（SQLite `dev.db`，数据库文件已从 git 移除、不入库） |
| `apps/mini/src/features/*` | 按领域拆分的业务模块（fasting/food/health-loop/plans/user-profile/wellness…） |
| `packages/contracts` | 前后端共享类型 |
| `prototypes/web-demo` | 早期 Web 原型 |
| `design.md` | UI 设计规范（v2.1；本文档第 3 节的 v3 为最新口径） |

**运行方式**（小程序端）：

```bash
pnpm install
cd apps/mini
npx uni -p mp-weixin     # 开发编译（watch），产物 dist/dev/mp-weixin，用微信开发者工具打开
npx vitest run           # 单元/契约测试
npx uni build -p mp-weixin
```

---

## 2. 这几天做了什么（按主题）

### 2.1 仓库环境修复（接手时编译已挂，优先做了这个）

接手时 `npx uni -p mp-weixin` 直接 `MODULE_NOT_FOUND`，逐层排查后确认三个叠加问题，**全部已修复**：

1. **坏符号链接** `apps/api/node_modules/@heban → packages`（指向整个目录而非具体包）。pnpm 安装时顺着它把 `domain`/`contracts` 链接建进了 `packages/` 自身，形成自指循环，每次安装都在不同包上报 `EPERM/ENOENT` 中断，留下大量残缺包。删除该链接后安装一次通过。
2. **根 `package.json` 被塞了 79 个误加依赖**（vitest/eslint 的传递依赖）。`estree-walker@3`（ESM-only）被提升到根目录遮蔽 vite 需要的 v2，导致 uni 读配置报 `ERR_PACKAGE_PATH_NOT_EXPORTED`。已整块移除。
3. **中断安装残留**：清理了 3.5 万+ 个 `*_tmp_*` 目录并补齐 7 个残缺包。

> ⚠️ 给后来者：这个仓库**不要用 `pnpm install --frozen-lockfile` 硬装**；如果安装报 EPERM rename，先查 `node_modules/.pnpm` 里的 `*_tmp_*` 残留与坏链接，必要时用 `--config.package-import-method=copy`。

### 2.2 全局视觉系统 v3「晨雾玻璃」（`apps/mini/src/styles/`）

接手时 `App.vue` 堆了 8 代互相覆盖的全局样式（1677 行、281 个 `!important`）， HomePage 有 15+ 个打架的 scoped 样式块——这是"丑、像 AI"的直接原因。已重构为**单一来源**：

- `styles/mini-tokens.css`：全部设计令牌（色板/材质/圆角/阴影/blur/gutter/tabbar 高度）
- `styles/visual-system.css`：最后加载的统一层（玻璃卡片、按钮、输入、顶栏、蒙层、各详情页表面）
- `App.vue` 瘦身为骨架：基础 reset、入场动效（hz-rise）、页面容器、安全区，~250 行

**设计语言**：暖象牙画布 `#FFFDF9` + 三层柔光氛围（右上晨绿/左侧天蓝/底部暖阳，直接画在 `page` 背景上）+ 玻璃表面（`rgba(255,255,255,.82)` + `blur(18px) saturate(1.5)` + 1px 内高光 + 单层柔影）。功能色只允许低饱和青蓝（水）、玫瑰（经期）、琥珀（饮食提示）。旧安卓 `backdrop-filter` 降级为实色 `#ffffff`。

**踩坑备忘（重要）**：
- `.page` 上 `overflow-x: hidden` 会让所有子元素 `position: sticky` 失效（产生滚动容器）→ 必须用 `overflow-x: clip`
- **iOS WKWebView 上，带 `backdrop-filter` 的祖先元素会让里面的 `<input>` 无法聚焦** → 弹层/表单容器一律禁用模糊（已写进 visual-system 并注释）
- 微信 `button` 默认 line-height 导致文字偏上 → 主行动按钮统一 `flex 居中 + line-height:1`
- **WXML 不支持内联 `<svg>`** → 折线图用「旋转线段 view + 圆点 view」渲染（见 2.5）
- 多个 `<style scoped>` 块在同一 .vue 里按顺序覆盖，追加新块时务必包好标签（曾漏包导致整块样式丢失）

### 2.3 导航与页面结构

- 底部导航定为：**首页 / 社区 / 序序(中) / 计划 / 我的**（玻璃磨砂底）
- 新增 `pages/community/CommunityPage.vue`：社区占位页（"建设中·待后续开发"），整幅水彩横幅 + 三个"即将上线"预览卡
- 「记录」页（RecordsPage）移出 tab、改为普通跳转页（带原生返回），入口在首页与「我的」；`navigation.ts`/`router.ts`/相关契约测试已同步
- 首页右上角 = 序序头像（与底部 tab 同图），带**随机健康小贴士气泡**（每次进入页面随机一句，可点击进聊天）；「我的」页新增**换头像（chooseImage+saveFile 持久化）与改昵称**（`features/user-profile/user-profile.ts`，首页问候语同步）

### 2.4 图表重写（微信不支持 SVG）

体重页趋势图 + 首页体重卡迷你图原为内联 SVG（微信完全不渲染）。重写为 **view 线段方案**：JS 计算每段长度/角度（`atan2`），旋转的圆角 view 拼成折线 + 圆点数据端点 + 虚线网格 + 目标线。数据口径：**一天一个点，当天最后一次覆盖之前的**（体重页与首页都已按天去重）。点可点击查看单次记录。

### 2.5 详情页统一（首页每张卡的下钻页）

体重/喝水/睡眠/运动/心情/轻断食/经期/用药/饮食 各详情页全部收进同一套玻璃语言：吸顶毛玻璃导航（返回圆钮常驻）、玻璃卡片区、`section-title` 品牌装饰条、统计砖、发丝线历史列表、渐变进度条。另有页面专项：

- **喝水页**：统计卡带进度条；"记录水"深青渐变 CTA；快捷按钮/历史行精修（杯子与水位绘制的几何已按杯体内壁精确重写过，如需再动请读 `WaterPage.vue` 内注释）
- **运动页**：hero 通栏 560rpx + 左侧渐变衬底；**27 项运动六分类**（有氧/力量/柔韧/球类/水中/休闲），图标为 20 个新绘的统一线条 SVG（`static/icons/svg/sport-*.svg`）+ 6 个原有图标
- **心情/睡眠页**：`widthFix` 整幅插画 + 文案渐变叠入（修复过图片溢出压文案的层级问题）

### 2.6 计划页（这一轮修的三个 bug + 布局重排）

1. **打卡"有些点不动"**：勾选后列表立即把已完成项沉底重排 → 行位置跳走，下一次点击落在别的任务上。已改为**顺序稳定**；勾选圈 42→52rpx，整行可点；`plan-store.read()` 规范化历史数据（旧记录缺 `doneDates` 会导致勾选报错）。
2. **自定义计划保存不了**：弹层 `z-index:30` 被固定 tabbar（`z-index:99`）盖住，底部"创建/保存"按钮点不到。所有弹层蒙层统一 `z-index:150`，且计划页在弹层打开期间隐藏 tabbar（同首页模式）。
3. **布局重排**：hero 改为通栏紧凑横幅（1240×770 裁切，显示约 466rpx，信息区上叠衔接），页面留白收紧。社区页 hero 同理改为整幅 `widthFix` 完整展示。

### 2.7 测试与契约

`npx vitest run`：**145 通过 / 7 失败**。这 7 个全部是"契约测试与实现漂移"，**不是本轮引入**（会话开始前就有 4 个，另外 3 个来自并行会话新增的 spec）：

```
food-detail-fallback / food-recognition / user-foods /
food-confirm(×2) / home-actions(mealRecordIcons 期望 .svg 实为 .png) / records-experience(期望 /static/icons/forward.svg 实为 /static/icons/svg/)
```

处理建议：要么按 spec 补实现，要么确认后改 spec。仓库存在**并行会话/编辑器同时改文件**的情况（观察到 CRLF 转换、文件被建又被删），建议避免两边同时动。

---

## 3. 设计规范速查（v3「晨雾玻璃」）

- 画布 `#FFFDF9`；墨色 `#21372C`；次级 `#45604F`；弱化 `#7D9085`；主绿 `#2F6B4D`/亮 `#48A377`
- 玻璃 = `rgba(255,255,255,.82)` + `blur(18px) saturate(1.5)` + `inset 0 1rpx 0 rgba(255,255,255,.85)` + 单层 `0 10rpx 30rpx rgba(29,55,41,.07)`
- 圆角：卡片 24 / 控件 18rpx；主按钮 `min-height 80rpx`、晨绿玻璃、flex 居中、按压 `scale(.985)`
- 语义变体只换色相不换材质：喝水=青蓝、经期=玫瑰渐变实底
- 插画一律 `mix-blend-mode: multiply` 溶入画布；hero 通栏用 `widthFix`（完整）或预裁同比例图（铺满零裁切）
- 新页面门禁：375/360 无横向溢出、iOS 安全区、图片完整、每屏一个主动作、旧安卓实色降级

---

## 4. 已知问题与风险

1. 上述 7 个契约漂移测试。
2. `apps/api/prisma/dev.db` 是本地 SQLite 数据库（已从 git 移除但保留在磁盘），里面是演示数据。
3. `mini-src-baseline-backup-2026-09-03.patch`（在 `D:\禾伴\` 下，不在仓库内）是本次重构前的工作区快照备份；`D:\禾伴\_workspace_backups\` 存有被替换的旧 `packages/.ignored_*` 目录。
4. 首页 `home-actions.ts` 的 `mealRecordIcons` 用的是 png（三餐水彩图），但 `home-actions.spec.ts` 期望 svg——二选一处理。
5. 小程序包体：`static/illustrations` 里部分原图较大（single ~1.5MB），后续可统一压缩或转 webp（dist 里构建工具已生成 webp 副本）。

## 5. 后续建议（按优先级）

1. 解决 7 个契约漂移（半小时内可清完，优先清 `records-experience` 与 `home-actions`）
2. 把 `design.md` 的 v2.1 章节更新为本文档第 3 节的 v3 口径
3. 社区功能启动时：`CommunityPage` 的三个"即将上线"卡片就是产品骨架（打卡陪伴/经验分享/小组挑战）
4. 长期：把各详情页剩余的旧 scoped 样式逐步迁到令牌（现在是"全局统一层 + 页面遗留"的过渡态，视觉已一致）
