# 文档中心

> 禾伴项目完整文档索引

---

## 🎯 根据角色选择文档

### 我是新加入的 AI 开发者
👉 从这里开始：
1. **[新手快速入门](QUICK-START.md)** - 5分钟了解项目，10分钟开始开发
2. **[首页开发交接文档](AI-HANDOFF-HomePage.md)** - 当前开发状态和详细规范
3. **[代码规范](CODE-STANDARDS.md)** - 编码标准和最佳实践

### 我要开发特定功能
👉 查看模块文档：
- **[首页开发](AI-HANDOFF-HomePage.md)** - 首页功能、设计规范、待开发任务
- **[编辑卡片功能](AI-HANDOFF-HomePage.md#优先级-1编辑首页卡片功能)** - 详细设计和实现方案

### 我要了解整体架构
👉 查看这些：
- **[项目 README](../README.md)** - 项目整体介绍
- **[项目结构规范](engineering/project-structure.md)** - 代码组织
- **[架构决策记录](architecture/)** - 技术选型和架构设计

### 我遇到了问题
👉 先看常见问题：
- **[快速入门 - 常见问题](QUICK-START.md#常见问题速查)** - 开发环境问题
- **[首页交接文档 - 常见问题](AI-HANDOFF-HomePage.md#常见问题)** - 首页开发问题

---

## 📚 文档列表

### 核心文档（必读）

| 文档 | 描述 | 阅读时间 | 优先级 |
|------|------|----------|--------|
| [QUICK-START.md](QUICK-START.md) | 新手快速入门指南 | 5分钟 | 🔴 高 |
| [AI-HANDOFF-HomePage.md](AI-HANDOFF-HomePage.md) | 首页开发交接文档 | 15分钟 | 🔴 高 |
| [CODE-STANDARDS.md](CODE-STANDARDS.md) | 代码规范与最佳实践 | 10分钟 | 🟡 中 |
| [../README.md](../README.md) | 项目整体说明 | 5分钟 | 🟡 中 |

### 设计与规范

| 文档 | 描述 |
|------|------|
| [AI-HANDOFF-HomePage.md#设计规范](AI-HANDOFF-HomePage.md#设计规范) | 颜色、尺寸、字体、图标规范 |
| [IMAGE-RESOURCES-PLAN.md](../IMAGE-RESOURCES-PLAN.md) | 图标资源规划 |

### 开发指南

| 文档 | 描述 |
|------|------|
| [AI-HANDOFF-HomePage.md#开发流程](AI-HANDOFF-HomePage.md#开发流程) | 本地开发、测试、构建、提交流程 |
| [CODE-STANDARDS.md#Vue组件规范](CODE-STANDARDS.md#vue组件规范) | Vue 组件编写规范 |
| [CODE-STANDARDS.md#TypeScript规范](CODE-STANDARDS.md#typescript规范) | TypeScript 使用规范 |

### 架构文档

| 文档 | 描述 |
|------|------|
| [engineering/project-structure.md](engineering/project-structure.md) | 项目结构规范 |
| [architecture/](architecture/) | 架构决策记录 |

### 需求与设计

| 文档 | 描述 |
|------|------|
| [superpowers/specs/](superpowers/specs/) | 功能规格说明 |
| [superpowers/plans/](superpowers/plans/) | 实施计划 |

---

## 🔍 按主题查找

### 首页开发

- [首页完整交接文档](AI-HANDOFF-HomePage.md)
  - 当前开发状态
  - 已完成功能列表
  - 待开发功能（编辑卡片、运动记录等）
  - 首页架构和数据流
  - 设计规范（颜色、尺寸、图标）
  - 开发流程
  - 常见问题

### 编辑首页卡片功能

- [详细设计文档](AI-HANDOFF-HomePage.md#优先级-1编辑首页卡片功能)
  - 功能描述
  - 页面结构
  - 数据结构
  - 默认卡片配置
  - 实现要点
  - 样式参考

### 代码规范

- [完整代码规范](CODE-STANDARDS.md)
  - 通用规范
  - Vue 组件规范
  - TypeScript 规范
  - 样式规范
  - 命名规范
  - 注释规范
  - 最佳实践

### 设计规范

- [颜色系统](AI-HANDOFF-HomePage.md#颜色系统)
- [尺寸规范](AI-HANDOFF-HomePage.md#尺寸规范)
- [字体规范](AI-HANDOFF-HomePage.md#字体规范)
- [图标规范](AI-HANDOFF-HomePage.md#图标规范)

### 开发环境

- [快速开始](QUICK-START.md#快速开始5分钟)
- [本地开发](QUICK-START.md#本地开发10分钟)
- [常用命令](QUICK-START.md#常用命令)
- [工作流程](QUICK-START.md#工作流程)

### 问题排查

- [常见问题速查](QUICK-START.md#常见问题速查)
- [首页常见问题](AI-HANDOFF-HomePage.md#常见问题)

---

## 🎯 快速链接

### 当前重点任务

🔴 **[编辑首页卡片功能](AI-HANDOFF-HomePage.md#优先级-1编辑首页卡片功能)**
- 创建 `apps/mini/src/pages/home/edit-cards.vue`
- 实现卡片显示/隐藏
- 实现拖拽排序
- 实现配置保存

### 常用资源

- **代码位置**：`apps/mini/src/pages/home/HomePage.vue`
- **图标位置**：`apps/mini/src/static/icons/`
- **待配置资源**：`assets/icon/`

### 外部文档

- [Vue 3 文档](https://cn.vuejs.org/)
- [UniApp 文档](https://uniapp.dcloud.net.cn/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

## 📝 文档维护

### 文档更新规则

1. **完成功能后**：更新 `AI-HANDOFF-HomePage.md` 的"已完成功能"和"更新日志"
2. **添加新规范时**：更新 `CODE-STANDARDS.md`
3. **项目结构变化**：更新 `QUICK-START.md` 和相关文档
4. **新增文档时**：更新本文档索引

### 文档版本

| 文档 | 版本 | 最后更新 |
|------|------|----------|
| QUICK-START.md | 1.0 | 2024-08-28 |
| AI-HANDOFF-HomePage.md | 1.0 | 2024-08-28 18:33 |
| CODE-STANDARDS.md | 1.0 | 2024-08-28 |
| README-INDEX.md | 1.0 | 2024-08-28 |

---

## 🤝 贡献指南

### 如何更新文档

1. 直接编辑对应的 Markdown 文件
2. 遵循已有的格式和结构
3. 更新本文档的索引（如果添加了新文档）
4. 提交时注明文档更新

### 文档命名规范

- 全大写 + 连字符：`README-INDEX.md`, `QUICK-START.md`
- 描述性名称：能从文件名看出内容
- 使用英文：保持一致性

### 文档结构规范

```markdown
# 文档标题

> 简短的一句话描述

---

## 📋 目录（如果内容较多）

---

## 正文内容

### 使用合适的标题层级

### 使用表格组织信息

### 使用代码块展示代码

---

## 参考资料（如果有）
```

---

## 💡 提示

- 📖 **先看文档再问问题** - 大部分答案都在文档里
- 🔍 **善用搜索** - Ctrl+F 在文档中搜索关键词
- 📝 **及时更新** - 完成功能后记得更新文档
- 🤝 **完善文档** - 发现文档不清楚的地方，帮忙完善

---

**文档维护者**：AI Development Team  
**最后更新**：2024-08-28
