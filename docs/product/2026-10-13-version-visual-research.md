# 2026-10-13 资料与视觉补充

## 原始资料与访问范围

- 邵艾伦训练原片：https://www.bilibili.com/video/BV1httT6LEfy/ 。作者合集页面能核对标题与发布信息；直接视频页返回 412，未取得完整字幕。
- 邵艾伦与孙宇晨对谈：https://www.bilibili.com/video/BV1fcHD6cEw3/ 。本次另在作者 YouTube 页 https://www.youtube.com/watch?v=0Z-vhBvBmUY 核对了标题、作者邵艾伦Alan、4:22:29 时长和简介。播放器显示无法显示字幕，未声称完整观看或取得原片逐字稿。
- 作者训练文字入口：https://x.com/AlanShao111/article/2100011450840526918 ，访问返回 403。
- 公开学习笔记：https://bingqiangzhou.github.io/posts/lean-muscle-bible-notes/ 、https://bingqiangzhou.github.io/posts/justin-sun-ai-era-interview/ ，仅作为二手观看笔记与继续查阅线索，未将其中个人体脂、补剂、金融或医学说法设为产品默认。
- 高性价比人生指南原文与许可：https://github.com/eternity4719/HowToLiveBetter 。本次核对主分支 README，文字 CC BY 4.0，保留原仓库、许可与改编说明。

## 产品落实

每本书的主题列表增加阅读导引和原始资料入口。薄肌继续强调可比较的真实记录、饮食完整性和恢复；孙学保留信息准备与个人小实验；Codex 保留具体目标和验证模板；人生指南提供低风险选编而非全量照抄。文章与八章圣经的产品实践属于原创整理，来源类型在阅读页注明。

## 视觉与交互验收

共享导航改为贴近画布的页眉，图书/长文使用暖纸配色；标题左对齐，返回按钮 44px，微信胶囊动态避让，状态栏与异常值回退。正文增加可展开目录、字号切换、章节位置与短切换动效。目录通过真实页面测量计算 scrollTop，375px 检查章节 top=55.77px、顶栏 bottom=44px，无遮挡。

模型生成了蓝色饮水书封、水彩书本茶杯静物，原图留在 assets，界面使用约 40KB 和 14KB 衍生图。五本书、正文、设置、训练、证据与评分使用统一文字层级；减少动效有专门降级。修复饮水杯重复 scale(2.05) 导致裁切，以及 water-page 主题类缺失。训练删除组按钮扩大到 44px，并为其预留网格空间。

83 个测试文件通过，249 项通过、1 项原有跳过；新增导航布局与目录定位 9 项回归测试。类型检查、相关 ESLint 及目录结构通过。开发预览 watcher 正常，不进行 App/cloud/release 打包或发布。浏览器使用实际 Vue/共享 App 样式及独立测试数据；真机表现仍需用户在微信开发者工具体验。
