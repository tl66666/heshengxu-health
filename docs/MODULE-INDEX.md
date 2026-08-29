# 模块索引文档

> 所有功能模块的快速索引和说明

**更新时间**：2024-08-28 18:55  
**版本**：1.0

---

## 📋 快速导航

- [Features 功能模块](#features-功能模块)
- [Pages 页面模块](#pages-页面模块)
- [Components 组件模块](#components-组件模块)
- [模块依赖关系](#模块依赖关系)

---

## 🎯 Features 功能模块

### 核心业务模块

| 模块 | 路径 | 功能 | 优先级 | 状态 |
|------|------|------|--------|------|
| **health-loop** | `features/health-loop/` | 健康循环核心 | 🔴 最高 | ✅ 完成 |
| **health-records** | `features/health-records/` | 健康记录管理 | 🔴 高 | ✅ 完成 |
| **food** | `features/food/` | 饮食管理 | 🟡 中 | ✅ 完成 |
| **health-profile** | `features/health-profile/` | 健康档案 | 🟡 中 | ✅ 完成 |
| **weekly-review** | `features/weekly-review/` | 周报统计 | 🟢 低 | ✅ 完成 |

---

### 1. health-loop（健康循环）⭐ 核心

**路径**：`apps/mini/src/features/health-loop/`

**功能**：管理每日健康数据闭环

**核心文件**：
```
health-loop/
├── health-loop.service.ts      # API 服务
├── health-loop.store.ts        # 状态管理 ⭐ 最重要
├── daily-experience.ts         # 每日体验计算
├── plan-presentation.ts        # 计划展示逻辑
├── record-presentation.ts      # 记录展示逻辑
└── local-demo.ts              # 本地演示数据
```

**主要类型**：
```typescript
interface TodayState {
  activePlan: HealthPlan | null;      // 活跃计划
  todayRecords: TodayRecords;         // 今日记录
  displayName: string;                // 用户昵称
}

interface TodayRecords {
  weight?: WeightRecord;              // 体重
  food?: FoodRecord[];                // 饮食
  water?: WaterRecord;                // 喝水
  sleep?: SleepRecord;                // 睡眠
  activity?: ActivityRecord;          // 活动
}
```

**使用示例**：
```vue
<script setup lang="ts">
import { healthLoopState } from '@/features/health-loop/health-loop.store';

// 直接使用响应式状态
const { today, loading, error } = healthLoopState;

// 加载数据
healthLoopState.load();
</script>
```

**依赖**：
- `packages/contracts` - 类型定义
- `health-records` - 记录管理

**被依赖**：
- ✅ HomePage - 首页显示
- ✅ RecordsPage - 记录页
- ✅ ProfilePage - 个人页

---

### 2. health-records（健康记录）

**路径**：`apps/mini/src/features/health-records/`

**功能**：管理各类健康记录的 CRUD

**核心文件**：
```
health-records/
├── health-records.service.ts      # API 服务
├── health-records.store.ts        # 状态管理
├── health-records.types.ts        # 类型定义
├── health-records.mapper.ts       # 数据映射
├── health-records.validation.ts   # 数据验证
└── records-focus.ts              # 焦点管理
```

**支持的记录类型**：
```typescript
type HealthRecordType = 
  | 'weight'      // 体重
  | 'food'        // 饮食
  | 'water'       // 喝水
  | 'sleep'       // 睡眠
  | 'activity'    // 活动
  | 'mood'        // 心情
  | 'blood-sugar' // 血糖
  | ...;
```

**使用示例**：
```typescript
import { healthRecordsStore } from '@/features/health-records/health-records.store';

// 添加体重记录
await healthRecordsStore.addRecord('weight', {
  valueKg: 68.5,
  recordedAt: new Date().toISOString()
});
```

**依赖**：
- `packages/contracts` - 类型定义

**被依赖**：
- ✅ health-loop - 健康循环
- ✅ RecordsPage - 记录页
- ✅ HomePage - 首页卡片

---

### 3. food（饮食管理）

**路径**：`apps/mini/src/features/food/`

**功能**：饮食识别、记录、统计

**核心文件**：
```
food/
├── food.service.ts              # API 服务
├── food.types.ts               # 类型定义
├── food-recognition.ts         # AI 识别逻辑
├── food-entry-form.ts          # 表单逻辑
└── food.summary.ts             # 统计逻辑
```

**主要功能**：
- 📷 拍照识别食物
- ✍️ 手动输入食物
- 📊 热量计算
- 📈 饮食统计

**使用示例**：
```typescript
import { recognizeFood } from '@/features/food/food-recognition';

// 识别食物
const result = await recognizeFood(imageFile);
// { name: '苹果', calories: 52, weight: 100 }
```

**依赖**：
- `packages/contracts` - 类型定义
- `health-records` - 记录保存

**被依赖**：
- ✅ FoodRecognitionPage - 识别页
- ✅ FoodConfirmPage - 确认页
- ✅ HomePage - 饮食卡片

---

### 4. health-profile（健康档案）

**路径**：`apps/mini/src/features/health-profile/`

**功能**：用户健康档案管理

**核心文件**：
```
health-profile/
├── health-profile.service.ts    # API 服务
├── health-profile.types.ts      # 类型定义
├── profile-loader.ts           # 加载逻辑
└── profile-save.ts             # 保存逻辑
```

**档案内容**：
```typescript
interface HealthProfile {
  personalInfo: {
    name: string;
    age: number;
    gender: 'male' | 'female';
    height: number;
  };
  healthGoals: {
    targetWeight: number;
    targetDate: string;
    motivation: string;
  };
  preferences: {
    dietType?: string;
    restrictions?: string[];
  };
}
```

**依赖**：
- `packages/contracts` - 类型定义

**被依赖**：
- ✅ ProfilePage - 个人页
- ✅ OnboardingPage - 建档页

---

### 5. weekly-review（周报）

**路径**：`apps/mini/src/features/weekly-review/`

**功能**：生成每周健康报告

**核心文件**：
```
weekly-review/
└── weekly-review.presentation.ts
```

**功能**：
- 📊 一周数据汇总
- 📈 趋势分析
- 💡 健康建议

**依赖**：
- `health-loop` - 获取每日数据
- `health-records` - 获取记录

**被依赖**：
- ✅ WeeklyReviewPage - 周报页

---

## 📄 Pages 页面模块

### 页面分类

| 分类 | 页面 | 路径 | 功能 | 状态 |
|------|------|------|------|------|
| **首页** | 首页 | `pages/home/HomePage.vue` | 健康数据概览 | ✅ V9.2 |
| **饮食** | 识别 | `pages/food-recognition/` | 拍照识别食物 | ✅ |
| **饮食** | 候选 | `pages/food-candidates/` | 选择识别结果 | ✅ |
| **饮食** | 确认 | `pages/food-confirm/` | 确认食物信息 | ✅ |
| **饮食** | 搜索 | `pages/food-search/` | 搜索食物 | ✅ |
| **个人** | 个人页 | `pages/profile/ProfilePage.vue` | 个人信息 | ✅ |
| **个人** | 编辑 | `pages/profile-edit/` | 编辑个人信息 | ✅ |
| **记录** | 记录页 | `pages/records/RecordsPage.vue` | 记录健康数据 | ✅ |
| **计划** | 计划页 | `pages/plan/PlanPage.vue` | 健康计划 | ✅ |
| **计划** | 设置 | `pages/plan-setup/` | 设置计划 | ✅ |
| **聊天** | 序序 | `pages/xuxu/XuxuPage.vue` | AI 聊天 | ✅ |
| **周报** | 周报 | `pages/weekly-review/` | 每周报告 | ✅ |
| **引导** | 建档 | `pages/onboarding/` | 首次建档 | ✅ |
| **引导** | 启动 | `pages/bootstrap/` | 启动页 | ✅ |

### 页面详情

#### 1. HomePage（首页）⭐

**路径**：`pages/home/HomePage.vue`  
**版本**：V9.2  
**状态**：✅ 完成

**功能**：
- 体重管理进度
- 饮食热量统计
- 快捷记录入口
- 功能卡片（喝水、睡眠、活动、心情）

**数据来源**：
```typescript
import { healthLoopState } from '@/features/health-loop/health-loop.store';
const { today } = healthLoopState;
```

**路由**：
```json
{
  "path": "pages/home/HomePage",
  "style": {
    "navigationBarTitleText": "首页",
    "navigationStyle": "custom"
  }
}
```

**详细文档**：[AI-HANDOFF-HomePage.md](AI-HANDOFF-HomePage.md)

---

#### 2. RecordsPage（记录页）

**路径**：`pages/records/RecordsPage.vue`

**功能**：记录各类健康数据

**支持类型**：
- 体重
- 饮食
- 喝水
- 睡眠
- 活动
- 心情

**使用**：
```typescript
// 跳转到记录页
uni.navigateTo({ 
  url: '/pages/records/RecordsPage?type=weight' 
});
```

---

#### 3. XuxuPage（序序聊天）

**路径**：`pages/xuxu/XuxuPage.vue`

**功能**：与 AI 助手序序对话

**特点**：
- 💬 自然语言对话
- 🤖 健康建议
- 📊 数据解读

---

## 🧩 Components 组件模块

### 组件分类

| 分类 | 组件 | 路径 | 功能 | 复用性 |
|------|------|------|------|--------|
| **导航** | MiniTabBar | `components/MiniTabBar.vue` | 底部导航 | ⭐⭐⭐ 高 |
| **导航** | AppNavBar | `components/AppNavBar.vue` | 顶部导航 | ⭐⭐⭐ 高 |
| **聊天** | XuxuChatComposer | `components/XuxuChatComposer.vue` | 聊天输入 | ⭐⭐ 中 |
| **聊天** | XuxuHint | `components/XuxuHint.vue` | 聊天提示 | ⭐⭐ 中 |
| **展示** | IllustratedHero | `components/IllustratedHero.vue` | 插画展示 | ⭐⭐ 中 |

### 组件详情

#### MiniTabBar（底部导航）

**使用**：
```vue
<template>
  <MiniTabBar active="home" />
</template>
```

**Props**：
```typescript
interface Props {
  active: 'home' | 'records' | 'xuxu' | 'plan' | 'me';
}
```

---

## 🔗 模块依赖关系

### 核心依赖图

```
                    packages/contracts (类型)
                            ↓
          ┌─────────────────┴─────────────────┐
          ↓                                   ↓
    features/health-loop              features/health-records
          ↓                                   ↓
    features/food                      features/health-profile
          ↓                                   ↓
          └─────────────────┬─────────────────┘
                           ↓
                      pages/ (所有页面)
                           ↓
                      components/
```

### 详细依赖关系

**health-loop（核心）**
- ← 被所有页面依赖
- → 依赖 health-records
- → 依赖 contracts

**health-records**
- ← 被 health-loop 依赖
- ← 被 RecordsPage 依赖
- → 依赖 contracts

**food**
- ← 被 food-* 页面依赖
- → 依赖 health-records
- → 依赖 contracts

**pages**
- → 依赖所有 features
- → 依赖 components

**components**
- ← 被 pages 依赖
- → 部分依赖 features（业务组件）

---

## 📊 模块统计

### 代码量统计

| 模块 | 文件数 | 代码行数（估算） | 测试覆盖 |
|------|--------|-----------------|----------|
| health-loop | 7 | ~800 | ⭐⭐⭐⭐ |
| health-records | 8 | ~1000 | ⭐⭐⭐⭐ |
| food | 6 | ~600 | ⭐⭐⭐⭐ |
| health-profile | 5 | ~400 | ⭐⭐⭐ |
| weekly-review | 1 | ~100 | ⭐⭐ |
| pages | 21 | ~3000 | ⭐⭐⭐ |
| components | 10 | ~800 | ⭐⭐⭐ |

---

## 🎯 开发指南

### 新增功能模块

1. **创建目录**：`features/new-feature/`
2. **创建文件**：
   ```
   new-feature/
   ├── new-feature.service.ts    # API 服务
   ├── new-feature.store.ts      # 状态管理（如需要）
   ├── new-feature.types.ts      # 类型定义
   ├── new-feature.logic.ts      # 业务逻辑
   ├── new-feature.spec.ts       # 单元测试
   └── README.md                 # 模块文档
   ```
3. **更新本文档**：添加到模块索引

### 新增页面

1. **创建目录**：`pages/new-page/`
2. **创建文件**：`NewPage.vue`
3. **配置路由**：在 `pages.json` 中添加
4. **更新本文档**：添加到页面列表

### 新增组件

1. **创建文件**：`components/NewComponent.vue`
2. **编写文档注释**
3. **更新本文档**：添加到组件列表

---

## 📚 相关文档

- [项目架构](PROJECT-ARCHITECTURE.md) - 整体架构
- [快速入门](QUICK-START.md) - 新手指南
- [代码规范](CODE-STANDARDS.md) - 编码标准
- [首页开发](AI-HANDOFF-HomePage.md) - 首页详细文档

---

## 🔄 更新日志

### 2024-08-28
- 创建模块索引文档
- 梳理所有 features/pages/components
- 绘制依赖关系图

---

**文档维护者**：AI Development Team  
**最后更新**：2024-08-28 18:55
