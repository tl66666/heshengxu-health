# 禾伴项目架构文档

> 完整的项目架构说明，帮助开发者快速理解系统设计

**更新时间**：2024-08-28 18:50  
**架构版本**：1.0

---

## 📋 目录

1. [整体架构](#整体架构)
2. [技术栈](#技术栈)
3. [目录结构](#目录结构)
4. [模块划分](#模块划分)
5. [数据流](#数据流)
6. [核心概念](#核心概念)

---

## 🏗️ 整体架构

### 架构图（文本版）

```
┌─────────────────────────────────────────────────────────────┐
│                        禾伴健康管理系统                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │  小程序  │          │   API   │          │  基础设施 │
   │  (mini) │ ◄────────┤  (api)  │          │  (infra) │
   └────┬────┘          └────┬────┘          └─────────┘
        │                    │
        │              ┌─────▼─────┐
        │              │  数据库    │
        │              │ (Prisma)  │
        │              └───────────┘
        │
   ┌────▼──────────────────────────────────────┐
   │            共享包 (packages)                │
   ├──────────────┬──────────────┬─────────────┤
   │   contracts  │    domain    │   config    │
   │   (类型契约)  │  (领域逻辑)   │   (配置)     │
   └──────────────┴──────────────┴─────────────┘
```

### 分层架构

```
┌────────────────────────────────────────┐
│          展示层 (Presentation)          │  ← 页面组件、UI组件
├────────────────────────────────────────┤
│          业务层 (Business Logic)        │  ← Features 模块
├────────────────────────────────────────┤
│          服务层 (Services)              │  ← API 调用、数据转换
├────────────────────────────────────────┤
│          数据层 (Data)                  │  ← 状态管理、持久化
└────────────────────────────────────────┘
```

---

## 🛠️ 技术栈

### 前端（小程序）

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.x | UI 框架 |
| TypeScript | 5.x | 类型系统 |
| UniApp | 最新 | 跨平台框架 |
| Pinia | 2.x | 状态管理（通过 reactive） |
| Vitest | 最新 | 单元测试 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时 |
| NestJS | 最新 | 后端框架 |
| Prisma | 最新 | ORM |
| PostgreSQL | 14+ | 数据库 |

### 工具链

| 工具 | 用途 |
|------|------|
| pnpm | 包管理器 |
| Turborepo | Monorepo 工具 |
| ESLint | 代码检查 |
| Prettier | 代码格式化 |

---

## 📁 目录结构

### 根目录

```
heban-ai-health-demo/
├── apps/                      # 应用目录
│   ├── mini/                 # 微信小程序
│   └── api/                  # 后端 API
├── packages/                 # 共享包
│   ├── contracts/            # 类型契约
│   ├── domain/               # 领域逻辑
│   └── config/               # 配置
├── infra/                    # 基础设施
│   ├── docker/              # Docker 配置
│   └── azure/               # Azure 配置
├── docs/                     # 文档
│   ├── architecture/        # 架构文档
│   ├── engineering/         # 工程文档
│   └── superpowers/         # 需求文档
├── assets/                   # 资源文件
│   ├── icon/                # 图标资源
│   └── illustrations/       # 插画资源
├── scripts/                  # 脚本
└── prototypes/              # 原型
```

### 小程序结构（apps/mini/src）

```
src/
├── pages/                    # 页面
│   ├── home/                # 首页
│   ├── food/                # 饮食相关页面
│   ├── profile/             # 个人相关页面
│   └── ...
├── components/              # 组件
│   ├── MiniTabBar.vue      # 通用组件
│   ├── XuxuChatComposer.vue # 业务组件
│   └── ...
├── features/                # 功能模块
│   ├── food/               # 饮食模块
│   ├── health-loop/        # 健康循环
│   ├── health-records/     # 健康记录
│   ├── health-profile/     # 健康档案
│   └── weekly-review/      # 周报
├── stores/                  # 全局状态
├── static/                  # 静态资源
│   ├── icons/              # 图标
│   └── illustrations/      # 插画
├── config/                  # 配置
├── App.vue                 # 应用入口
└── main.ts                 # 主文件
```

---

## 🧩 模块划分

### Features 模块（核心业务）

```
features/
├── food/                          # 饮食模块
│   ├── food.service.ts           # 饮食服务
│   ├── food.types.ts             # 类型定义
│   ├── food-recognition.ts       # 识别逻辑
│   ├── food-entry-form.ts        # 表单逻辑
│   └── food.summary.ts           # 统计逻辑
│
├── health-loop/                   # 健康循环模块（核心）
│   ├── health-loop.service.ts    # 健康循环服务
│   ├── health-loop.store.ts      # 状态管理 ⭐
│   ├── daily-experience.ts       # 每日体验
│   ├── plan-presentation.ts      # 计划展示
│   └── record-presentation.ts    # 记录展示
│
├── health-records/                # 健康记录模块
│   ├── health-records.service.ts # 记录服务
│   ├── health-records.store.ts   # 状态管理
│   ├── health-records.types.ts   # 类型定义
│   ├── health-records.mapper.ts  # 数据映射
│   ├── health-records.validation.ts # 验证
│   └── records-focus.ts          # 焦点管理
│
├── health-profile/                # 健康档案模块
│   ├── health-profile.service.ts # 档案服务
│   ├── health-profile.types.ts   # 类型定义
│   ├── profile-loader.ts         # 加载逻辑
│   └── profile-save.ts           # 保存逻辑
│
└── weekly-review/                 # 周报模块
    └── weekly-review.presentation.ts
```

### Pages 模块（页面）

```
pages/
├── home/                          # 首页模块 ⭐
│   ├── HomePage.vue
│   ├── home-actions.ts
│   └── home-hero-art.ts
│
├── food-*/                        # 饮食相关页面
│   ├── FoodRecognitionPage.vue   # 识别
│   ├── FoodCandidatesPage.vue    # 候选
│   ├── FoodConfirmPage.vue       # 确认
│   └── FoodSearchPage.vue        # 搜索
│
├── profile/                       # 个人模块
│   ├── ProfilePage.vue
│   └── ProfileEditPage.vue
│
├── plan/                          # 计划模块
│   ├── PlanPage.vue
│   └── PlanSetupPage.vue
│
├── records/                       # 记录模块
│   └── RecordsPage.vue
│
├── xuxu/                          # 序序聊天
│   └── XuxuPage.vue
│
└── onboarding/                    # 引导模块
    └── OnboardingPage.vue
```

### Components 模块（组件）

```
components/
├── 通用组件
│   ├── MiniTabBar.vue            # 底部导航栏
│   └── AppNavBar.vue             # 顶部导航栏
│
├── 业务组件
│   ├── XuxuChatComposer.vue      # 序序聊天输入
│   ├── XuxuHint.vue              # 序序提示
│   └── IllustratedHero.vue       # 插画英雄区
│
└── 逻辑层
    ├── xuxu-chat.ts              # 聊天逻辑
    ├── companion-presentation.ts # 陪伴展示
    └── navigation.ts             # 导航逻辑
```

---

## 🔄 数据流

### 数据流向图

```
┌──────────┐
│  用户操作  │
└─────┬────┘
      │
      ▼
┌──────────┐     调用     ┌──────────┐
│  Page    │ ──────────► │ Feature  │
│ 页面组件  │              │  模块     │
└─────┬────┘              └─────┬────┘
      │                         │
      │ 展示                    │ 业务逻辑
      │                         │
      ▼                         ▼
┌──────────┐     订阅     ┌──────────┐
│Component │ ◄────────── │  Store   │
│  组件     │              │ 状态管理  │
└──────────┘              └─────┬────┘
                                │
                                │ 持久化
                                ▼
                          ┌──────────┐
                          │ Storage  │
                          │  存储     │
                          └──────────┘
```

### 典型数据流示例

**场景**：用户在首页查看体重数据

```
1. HomePage.vue 
   └─► 使用 healthLoopState（状态）
       └─► 调用 healthLoopState.load()
           └─► health-loop.service.ts 
               └─► 调用 API
                   └─► 返回数据
                       └─► 更新 store
                           └─► HomePage 自动更新显示
```

**场景**：用户记录饮食

```
1. HomePage.vue 点击"早餐"
   └─► 跳转到 FoodRecognitionPage.vue
       └─► 拍照/选择图片
           └─► 调用 food-recognition.ts
               └─► 识别食物
                   └─► FoodCandidatesPage 选择
                       └─► FoodConfirmPage 确认
                           └─► 调用 food.service.ts
                               └─► 保存到后端
                                   └─► 更新 healthLoopState
                                       └─► 首页数据刷新
```

---

## 💡 核心概念

### 1. Health Loop（健康循环）

**核心概念**：每日健康数据的闭环管理

**组成**：
- **Today**：今日数据
  - activePlan：活跃的健康计划
  - todayRecords：今日记录（体重、饮食、水分等）
  - experience：每日体验（基于数据计算）

**状态管理**：
```typescript
// health-loop.store.ts
const healthLoopState = {
  today: reactive<TodayState | null>(null),
  loading: ref(false),
  error: ref<string | null>(null),
  
  load: async () => { ... },
  refresh: async () => { ... }
};
```

### 2. Features（功能模块）

**设计原则**：
- 按业务功能划分
- 每个模块独立
- 包含 service/store/types
- 有完整的单元测试

**模块结构**：
```
feature-name/
├── feature-name.service.ts    # 服务层（API 调用）
├── feature-name.store.ts      # 状态管理（reactive）
├── feature-name.types.ts      # 类型定义
├── feature-name.logic.ts      # 业务逻辑
└── feature-name.spec.ts       # 单元测试
```

### 3. Pages（页面）

**设计原则**：
- 页面只负责展示和用户交互
- 业务逻辑在 features 中
- 页面通过 store 获取数据
- 页面调用 service/feature 方法

**页面组成**：
```vue
<template>
  <!-- 展示层 -->
</template>

<script setup lang="ts">
// 1. 导入 store
import { healthLoopState } from '@/features/health-loop/health-loop.store';

// 2. 导入业务逻辑
import { calculateProgress } from '@/features/health-loop/daily-experience';

// 3. 页面逻辑
const goToRecord = () => {
  uni.navigateTo({ url: '/pages/records/RecordsPage' });
};
</script>
```

### 4. Components（组件）

**分类**：
- **通用组件**：MiniTabBar、AppNavBar
  - 与业务无关
  - 可复用
  
- **业务组件**：XuxuChatComposer、IllustratedHero
  - 与业务相关
  - 特定场景使用

**设计原则**：
- Props 向下，Events 向上
- 单一职责
- 可测试

### 5. 状态管理

**方案**：使用 Vue 3 reactive + ref，不使用 Pinia/Vuex

**优点**：
- 简单直接
- 类型安全
- 性能好

**示例**：
```typescript
// store.ts
import { reactive, ref } from 'vue';

export const myStore = {
  data: reactive({ count: 0 }),
  loading: ref(false),
  
  increment() {
    this.data.count++;
  }
};

// 在组件中使用
<script setup>
import { myStore } from './store';

// 直接使用，自动响应式
</script>
```

---

## 🔐 数据持久化

### 本地存储

**使用场景**：
- 用户配置（首页卡片配置）
- 临时数据（未上传的记录）
- 缓存数据

**API**：
```typescript
// 保存
uni.setStorageSync('key', value);

// 读取
const value = uni.getStorageSync('key');

// 删除
uni.removeStorageSync('key');
```

### 后端存储

**使用场景**：
- 用户数据（健康档案）
- 健康记录（体重、饮食等）
- 计划数据

**流程**：
```
前端 → service.ts → API → 后端 → 数据库
```

---

## 🧪 测试策略

### 单元测试

**覆盖范围**：
- ✅ Features 模块的所有逻辑
- ✅ 纯函数
- ✅ 数据转换

**工具**：Vitest

**示例**：
```typescript
// daily-experience.spec.ts
import { describe, it, expect } from 'vitest';
import { deriveDailyExperience } from './daily-experience';

describe('deriveDailyExperience', () => {
  it('应该正确计算每日体验', () => {
    const result = deriveDailyExperience(mockData);
    expect(result.greeting).toBe('早上好');
  });
});
```

### 集成测试

**覆盖范围**：
- API 调用
- 页面流程

**工具**：手动测试 + 微信开发者工具

---

## 🚀 部署架构

### 开发环境

```
开发者电脑
  ├─► 微信开发者工具（前端）
  └─► 本地 API Server（后端）
```

### 生产环境

```
                ┌─► 微信小程序（用户端）
                │
用户 ─► CDN ────┤
                │
                └─► Azure API（后端）
                      └─► PostgreSQL（数据库）
```

---

## 📚 相关文档

- [快速入门](QUICK-START.md) - 新手指南
- [首页开发交接](AI-HANDOFF-HomePage.md) - 首页详细文档
- [代码规范](CODE-STANDARDS.md) - 编码标准
- [模块索引](MODULE-INDEX.md) - 所有模块说明

---

## 🔄 架构演进

### 当前版本：1.0

- ✅ Monorepo 架构
- ✅ Features 模块化
- ✅ TypeScript 全覆盖
- ✅ 单元测试覆盖

### 未来计划：2.0

- ⬜ 页面模块化重组
- ⬜ 组件库建设
- ⬜ 性能优化
- ⬜ E2E 测试

---

**文档维护者**：AI Development Team  
**最后更新**：2024-08-28 18:50
