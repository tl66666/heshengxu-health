# 首页卡片编辑交接

## 当前状态

- 编辑页：`apps/mini/src/pages/home/edit-cards/EditCardsPage.vue`
- 页面注册：`apps/mini/src/pages.json` 中的 `pages/home/edit-cards/EditCardsPage`
- 首页入口：`apps/mini/src/pages/home/HomePage.vue`
- 配置模块：`apps/mini/src/pages/home/home-card-settings.ts`
- 本地存储键：`heban_home_card_visibility`

## 卡片 ID

`weight-plan`、`food`、`weight-record`、`tracking`、`fasting`、`period`、`medication`

所有卡片默认显示。编辑页使用原生 `switch`，每次切换立即保存；首页在 `onShow` 时重新读取配置，因此从编辑页返回即可看到结果。隐藏卡片只改变首页展示，不删除任何健康记录。

## 后续修改注意

- 新增首页卡片时，同时更新 `HOME_CARD_DEFINITIONS`、`HomePage.vue` 的 `isCardVisible` 条件和编辑页分组。
- 不要把编辑页路径改回 `/pages/home/edit-cards`，实际页面路径是 `/pages/home/edit-cards/EditCardsPage`。
- 首页底部的经期、用药卡片采用白底和细色边界，插画只做小尺寸语义提示，不要恢复整块粉色或蓝色背景。

## 首页视觉系统（2026-08）

- 页面底色固定为低饱和鼠尾草灰绿 `#f2f6f3`，卡片统一使用暖白 `#fffefa`、细边框和低强度阴影。
- 主色为深鼠尾草绿（标题、数值、进度）；粉色只保留给经期左侧状态线和日期提示，不能用于整块背景；断食标签与用药使用同一套灰绿色标签。
- 首页不要叠加新的渐变、玻璃拟态或高饱和主题。`HomePage.vue` 末尾的“Final visual tokens”样式是最终覆盖层，新增样式需遵循同一色板。
- 序序人物和相机图片沿用现有资源，不重新生成或替换人物形象。插画只作为语义提示，使用 `mix-blend-mode: multiply` 消除白底边缘，并控制在卡片右下角的小比例。
- 餐次图标使用 `static/icons/svg/meal-*.svg`，不要改回 Emoji；图标容器保持中性灰绿色，不为每个餐次引入不同主题色。
- 语义插画不是背景水印：网格插画保持约 78% 透明度，断食/经期/用药插画保持约 72%，使用固定尺寸和 `mix-blend-mode: multiply`，避免缩小后发灰看不清。
- 食物搜索兼容微信小程序运行时：`food.service.ts` 使用 `buildFoodSearchQuery`（`encodeURIComponent`）而不是 `URLSearchParams`；接口不可用时搜索和分类会回退本地目录，进入早餐/午餐/晚餐/加餐页会直接加载可选食物。
