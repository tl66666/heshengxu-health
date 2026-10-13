# 薄肌模块生成图标

日期：2026-10-12。生成方式：内置 image_gen 工具，三次独立调用；工具未返回模型标识，因此不标注未经确认的具体模型版本。用途：本项目薄肌养成页面，已通过轻量派生资源接入客户端。

风格参考：`assets/mini-icons/watercolor/activity.png`，只参考水彩质感和薄荷绿/浅水蓝配色，不沿用跑步主体。三个文件实测均为 1254×1254、32 位 ARGB PNG 原图，左上角 alpha 为 0，主体中心 alpha 为 252–253，保留生成 alpha。原图已视觉检查，无文字和人物。

| 文件 | 用途 |
| --- | --- |
| lean-muscle.png | 薄肌养成入口，哑铃与嫩叶 |
| lean-muscle-score.png | 评分详情入口，分段表盘与叶片 |
| lean-muscle-bible.png | 薄肌圣经入口，打开的指南书与小哑铃 |

实际评分圆环、进度条和数字使用界面代码绘制；这些 PNG 仅作语义插画。原图保持不变，通过 scripts/build-lean-art.mjs 制作 160×160 的派生资源，单张分别为 8321 / 7518 / 8609 字节，保存到客户端 features/lean-muscle/art.ts 中。小资源以 PNG data URL 随页面加载，不依赖新增 CDN 部署；SVG 作为加载失败兜底。已在 375px 浏览器预览检查图标与小尺寸装饰，正式包不包含这些大原图。

## 完整生成提示词

### 力量入口

Use case: stylized-concept. Asset type: single square app feature icon for a gentle Chinese health habit app. Generate ONE icon: a compact symmetrical dumbbell with a small upward growing sage-green leaf behind it, representing lean muscle cultivation and steady strength progress. Match the reference image's soft Japanese watercolor icon treatment, but use stronger readable sage outlines for small screen legibility. Pastel mint, muted sage green, pale aqua highlights and warm ivory, subtle paper pigment within the object. Centered single simple silhouette filling about 72 percent of square with generous padding, isolated on a truly transparent background. No person, no skin, no lettering, no numbers, no surrounding frame, no badge, no background decoration, no glossy 3D plastic. Must be immediately recognizable at 48px. Reference image is style only; replace the running subject entirely.

### 薄肌圣经

Use case: stylized-concept. Asset type: ONE square feature icon for the Lean Muscle Bible, an actionable training guide in a gentle health app. Subject: one small open hardcover guidebook in three-quarter view, warm ivory pages, muted mint-green cover, a single tiny dumbbell symbol embedded on the facing page and one sage-green ribbon bookmark. Match the provided reference's soft Japanese watercolor pigment texture, pale aqua highlights and mint-sage palette, with enough darker sage edge definition for small icon readability. Centered compact recognizable silhouette filling approximately 70 percent of square, generous padding, genuinely transparent background. No text or numbers, no crosses or religious imagery, no character, no additional loose objects, no border or frame, no realistic photograph, no glossy 3D finish. Book and single dumbbell symbol are the only visual idea. Reference for style only, change subject entirely.

### 薄肌评分

Use case: stylized-concept. Asset type: ONE square small app icon for a lean muscle habit score. Subject: a small circular mint-green progress dial with a sage-green pointer pointing toward upper right, with ONE tiny leaf at the base; three simple muted dial arc sections, no digits and no tick labels. Readable silhouette, strong sage-green defining edges. Match reference soft Japanese watercolor pigment within shapes, low saturation mint green pale aqua and warm ivory highlights. Centered single compact object filling 70 percent of square with generous padding, genuine transparent background. No text, no numbers, no dumbbell, no person, no stars, no trophy, no gold medal, no surrounding frame, no glossy plastic, no background. Reference for watercolor palette and texture only; change subject entirely.
